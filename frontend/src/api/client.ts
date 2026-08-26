import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Default API URL (can be customized per environment)
export const API_BASE_URL = "http://localhost:8000/api/v1";

let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;
let onTokenExpiredCallback: (() => void) | null = null;

export const setAuthTokens = (accessToken: string | null, refreshToken: string | null) => {
  currentAccessToken = accessToken;
  currentRefreshToken = refreshToken;
};

export const getAuthTokens = () => ({
  accessToken: currentAccessToken,
  refreshToken: currentRefreshToken,
});

export const setOnTokenExpired = (callback: () => void) => {
  onTokenExpiredCallback = callback;
};

// Create main Axios client instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach 15-minute JWT Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (currentAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Catch 401 & auto-refresh using 90-day Refresh Token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!currentRefreshToken) {
        if (onTokenExpiredCallback) onTokenExpiredCallback();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call backend token refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: currentRefreshToken,
        });

        const { access_token, refresh_token } = response.data;
        setAuthTokens(access_token, refresh_token);

        processQueue(null, access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        setAuthTokens(null, null);
        if (onTokenExpiredCallback) {
          onTokenExpiredCallback();
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
