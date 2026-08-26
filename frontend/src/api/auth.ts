import apiClient from "./client";
import { AuthResponse, User } from "../types";

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", { email, password });
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/refresh", { refresh_token: refreshToken });
    return response.data;
  },

  logout: async (refreshToken?: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>("/auth/logout", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },
};
