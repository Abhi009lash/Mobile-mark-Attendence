import { logger } from '../utils/logger';
import { tokenStorage } from '../services/storage/tokenStorage';

function resolveApiBaseUrl(): string {
  let url = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.2:8000/api/v1';

  if (url.includes('0.0.0.0')) {
    url = url.replace('0.0.0.0', '192.168.0.2');
  }

  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id?: string | null;
  status: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserProfile;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface VerifyOTPResponse {
  reset_token: string;
  message: string;
}

export interface MessageResponse {
  message: string;
  dev_otp?: string | null;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let ongoingRefresh: Promise<string> | null = null;
let sessionExpiryListener: (() => void) | null = null;

export function onSessionExpired(callback: () => void): void {
  sessionExpiryListener = callback;
}

async function executeRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';

  logger.info('API:REQ', `--> ${method} ${url}`);

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (netErr: unknown) {
    const errorDetail = netErr instanceof Error ? netErr.message : String(netErr);
    logger.error('API:ERR', `Network failure reaching ${url}: ${errorDetail}`);
    throw new ApiError(
      `Network connection failed. Unable to reach backend at ${url}. Ensure mobile and computer are on the same Wi-Fi.`,
      0,
      'NETWORK_ERROR'
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.detail?.[0]?.msg ||
      data?.detail ||
      'An unexpected server error occurred.';
    const code = data?.error?.code || undefined;

    logger.warn('API:RESP_ERR', `<-- ${response.status} ${url}`, { message, code });
    throw new ApiError(message, response.status, code);
  }

  logger.info('API:RESP_OK', `<-- ${response.status} ${url}`);
  return data as T;
}

async function performSilentRefresh(): Promise<string> {
  if (ongoingRefresh) {
    return ongoingRefresh;
  }

  ongoingRefresh = (async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    logger.info('AUTH:REFRESH', 'Executing silent 90-day refresh rotation...');
    try {
      const data = await executeRequest<RefreshTokenResponse>('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      await tokenStorage.updateTokens(data.access_token, data.refresh_token);
      logger.info('AUTH:REFRESH', 'Silent token refresh succeeded. 15m session renewed.');
      return data.access_token;
    } catch (err) {
      logger.error('AUTH:REFRESH', 'Silent refresh rotation failed. Purging session.', err);
      await tokenStorage.clearSession();
      if (sessionExpiryListener) sessionExpiryListener();
      throw err;
    } finally {
      ongoingRefresh = null;
    }
  })();

  return ongoingRefresh;
}

export async function executeAuthRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = await tokenStorage.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    return await executeRequest<T>(endpoint, { ...options, headers });
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      logger.info('AUTH:AUTO_RENEW', `401 detected on ${endpoint}. Initiating silent refresh...`);
      try {
        const freshToken = await performSilentRefresh();
        headers['Authorization'] = `Bearer ${freshToken}`;
        logger.info('AUTH:AUTO_RENEW', `Retrying ${endpoint} with rotated access token`);
        return await executeRequest<T>(endpoint, { ...options, headers });
      } catch {
        throw new ApiError('Your 90-day session has expired. Please sign in again.', 401, 'SESSION_EXPIRED');
      }
    }
    throw err;
  }
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    logger.info('AUTH', `Attempting sign-in for: ${email}`);
    const data = await executeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    await tokenStorage.saveSession(data.access_token, data.refresh_token, data.user);
    return data;
  },

  async logout(accessToken?: string): Promise<MessageResponse> {
    logger.info('AUTH', 'Dispatching logout request');
    const token = accessToken || (await tokenStorage.getAccessToken());
    try {
      if (token) {
        await executeRequest<MessageResponse>('/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } finally {
      await tokenStorage.clearSession();
    }
    return { message: 'Successfully logged out.' };
  },

  async refresh(refreshToken?: string): Promise<RefreshTokenResponse> {
    const token = refreshToken || (await tokenStorage.getRefreshToken());
    if (!token) throw new ApiError('No refresh token present.', 400);

    const data = await executeRequest<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: token }),
    });
    await tokenStorage.updateTokens(data.access_token, data.refresh_token);
    return data;
  },

  async getMe(): Promise<UserProfile> {
    return executeAuthRequest<UserProfile>('/auth/me', { method: 'GET' });
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    return executeRequest<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
  },

  async verifyOtp(email: string, otp: string): Promise<VerifyOTPResponse> {
    return executeRequest<VerifyOTPResponse>('/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
    });
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<MessageResponse> {
    return executeRequest<MessageResponse>('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
    });
  },
};
