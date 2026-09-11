import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { UserProfile } from '../../api/auth';
import { logger } from '../../utils/logger';

const ACCESS_TOKEN_KEY = 'geopoint_access_token';
const REFRESH_TOKEN_KEY = 'geopoint_refresh_token';
const USER_PROFILE_KEY = 'geopoint_user_profile';

// In-memory fallback for environments where SecureStore is unavailable
const memoryStore: Record<string, string> = {};

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      memoryStore[key] = value;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (err) {
    logger.warn('STORAGE', `SecureStore setItem failed for ${key}, using memory fallback`, err);
    memoryStore[key] = value;
  }
}

async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key) || memoryStore[key] || null;
      }
      return memoryStore[key] || null;
    }
    return await SecureStore.getItemAsync(key);
  } catch (err) {
    logger.warn('STORAGE', `SecureStore getItem failed for ${key}, using memory fallback`, err);
    return memoryStore[key] || null;
  }
}

async function deleteItem(key: string): Promise<void> {
  try {
    delete memoryStore[key];
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (err) {
    logger.warn('STORAGE', `SecureStore deleteItem failed for ${key}`, err);
  }
}

export const tokenStorage = {
  async saveSession(accessToken: string, refreshToken: string, user: UserProfile): Promise<void> {
    await setItem(ACCESS_TOKEN_KEY, accessToken);
    await setItem(REFRESH_TOKEN_KEY, refreshToken);
    await setItem(USER_PROFILE_KEY, JSON.stringify(user));
    logger.info('STORAGE', 'User session and 90-day refresh token safely stored');
  },

  async updateTokens(accessToken: string, refreshToken: string): Promise<void> {
    await setItem(ACCESS_TOKEN_KEY, accessToken);
    await setItem(REFRESH_TOKEN_KEY, refreshToken);
    logger.info('STORAGE', 'Rotated tokens updated in secure storage');
  },

  async getAccessToken(): Promise<string | null> {
    return getItem(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return getItem(REFRESH_TOKEN_KEY);
  },

  async getStoredUser(): Promise<UserProfile | null> {
    const raw = await getItem(USER_PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  async clearSession(): Promise<void> {
    await deleteItem(ACCESS_TOKEN_KEY);
    await deleteItem(REFRESH_TOKEN_KEY);
    await deleteItem(USER_PROFILE_KEY);
    logger.info('STORAGE', 'User session safely purged');
  },
};
