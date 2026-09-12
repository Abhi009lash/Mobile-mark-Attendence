import { Platform } from 'react-native';
import { API_BASE_URL } from '../../../api/auth';

export const getFullLogoUrl = (logoUrl?: string | null): string | null => {
  if (!logoUrl) return null;
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('data:')) {
    return logoUrl;
  }
  let baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') {
      baseUrl = 'http://localhost:8000';
    } else if (h) {
      baseUrl = `http://${h}:8000`;
    }
  }
  const cleanPath = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
  return `${baseUrl}${cleanPath}`;
};
