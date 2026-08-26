import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, AuthResponse } from "../types";
import { authApi } from "../api/auth";
import { setAuthTokens, setOnTokenExpired } from "../api/client";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);

  useEffect(() => {
    // Setup token expiration listener
    setOnTokenExpired(() => {
      handleSessionExpired();
    });

    // Check existing stored session
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    setIsLoading(false);
  };

  const handleSessionExpired = () => {
    setUser(null);
    setRefreshTokenState(null);
    setAuthTokens(null, null);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authData: AuthResponse = await authApi.login(email, password);

      setAuthTokens(authData.access_token, authData.refresh_token);
      setRefreshTokenState(authData.refresh_token);

      const userProfile: User = {
        id: authData.user_id,
        email: authData.email,
        name: authData.name,
        role: authData.role,
        organization_id: authData.organization_id,
        branch_id: authData.branch_id,
        status: "active",
        created_at: new Date().toISOString(),
      };

      setUser(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      handleSessionExpired();
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
