import { Platform } from 'react-native';
import { executeAuthRequest, ApiError } from './auth';

export interface OrganizationCreatePayload {
  name: string;
  slug?: string;
  code?: string;
  website?: string;
  logo_url?: string;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  max_admins: number;
  max_employees: number;
}

export interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  code: string;
  website?: string | null;
  logo_url?: string | null;
  email: string;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
  max_admins: number;
  max_employees: number;
  current_admins: number;
  current_employees: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationListResponse {
  total: number;
  page: number;
  page_size: number;
  items: OrganizationItem[];
}

export const organizationsApi = {
  create: async (payload: OrganizationCreatePayload): Promise<OrganizationItem> => {
    return await executeAuthRequest<OrganizationItem>('/organizations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  uploadLogo: async (
    imageUri: string,
    mimeType = 'image/jpeg',
    fileName = 'org_logo.jpg'
  ): Promise<string> => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const resp = await fetch(imageUri);
      const blob = await resp.blob();
      formData.append('file', blob, fileName);
    } else {
      formData.append('file', {
        uri: imageUri,
        type: mimeType,
        name: fileName,
      } as unknown as Blob);
    }

    const res = await executeAuthRequest<{ logo_url: string }>('/organizations/upload-logo', {
      method: 'POST',
      body: formData,
    });
    return res.logo_url;
  },

  list: async (params?: { search?: string; status?: string; page?: number; page_size?: number }): Promise<OrganizationListResponse> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.page_size) query.append('page_size', String(params.page_size));

    const queryString = query.toString();
    const endpoint = queryString ? `/organizations?${queryString}` : '/organizations';
    return await executeAuthRequest<OrganizationListResponse>(endpoint, {
      method: 'GET',
    });
  },
};

export { ApiError };
