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

export interface OrganizationUpdatePayload {
  name?: string;
  code?: string;
  website?: string;
  logo_url?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  status?: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
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

export interface UploadLogoOptions {
  imageUri?: string;
  base64?: string;
  mimeType?: string;
  fileName?: string;
}

export const organizationsApi = {
  create: async (payload: OrganizationCreatePayload): Promise<OrganizationItem> => {
    return await executeAuthRequest<OrganizationItem>('/organizations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  uploadLogo: async (
    optionsOrUri: string | UploadLogoOptions,
    legacyMime = 'image/jpeg',
    legacyFileName = 'org_logo.jpg'
  ): Promise<string> => {
    let base64Data: string | undefined;
    let fileName = legacyFileName;
    let mimeType = legacyMime;
    let imageUri: string | undefined;

    if (typeof optionsOrUri === 'string') {
      imageUri = optionsOrUri;
    } else {
      imageUri = optionsOrUri.imageUri;
      base64Data = optionsOrUri.base64;
      if (optionsOrUri.fileName) fileName = optionsOrUri.fileName;
      if (optionsOrUri.mimeType) mimeType = optionsOrUri.mimeType;
    }

    // 1. Preferred: If base64 is provided, upload as clean JSON payload.
    // This avoids Expo SDK 57 "Unsupported FormDataPart implementation" error on React Native Android / iOS.
    if (base64Data) {
      const res = await executeAuthRequest<{ logo_url: string }>('/organizations/upload-logo', {
        method: 'POST',
        body: JSON.stringify({
          image_base64: base64Data,
          filename: fileName,
          mime_type: mimeType,
        }),
      });
      return res.logo_url;
    }

    // 2. Web fallback: fetch blob and append to FormData
    if (Platform.OS === 'web' && imageUri) {
      const resp = await fetch(imageUri);
      const blob = await resp.blob();
      const formData = new FormData();
      formData.append('file', blob, fileName);
      const res = await executeAuthRequest<{ logo_url: string }>('/organizations/upload-logo', {
        method: 'POST',
        body: formData,
      });
      return res.logo_url;
    }

    // 3. Native fallback if base64 wasn't passed
    if (imageUri) {
      try {
        const resp = await fetch(imageUri);
        const blob = await resp.blob();
        const reader = new FileReader();
        const b64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const fullB64 = await b64Promise;
        const res = await executeAuthRequest<{ logo_url: string }>('/organizations/upload-logo', {
          method: 'POST',
          body: JSON.stringify({
            image_base64: fullB64,
            filename: fileName,
            mime_type: mimeType,
          }),
        });
        return res.logo_url;
      } catch {
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          type: mimeType,
          name: fileName,
        } as unknown as Blob);
        const res = await executeAuthRequest<{ logo_url: string }>('/organizations/upload-logo', {
          method: 'POST',
          body: formData,
        });
        return res.logo_url;
      }
    }

    throw new ApiError('No image data provided for logo upload.', 400);
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

  delete: async (orgId: string): Promise<{ message: string }> => {
    return await executeAuthRequest<{ message: string }>(`/organizations/${orgId}`, {
      method: 'DELETE',
    });
  },

  updateLimits: async (
    orgId: string,
    limits: { max_admins?: number; max_employees?: number }
  ): Promise<OrganizationItem> => {
    return await executeAuthRequest<OrganizationItem>(`/organizations/${orgId}/limits`, {
      method: 'PUT',
      body: JSON.stringify(limits),
    });
  },

  update: async (
    orgId: string,
    payload: OrganizationUpdatePayload
  ): Promise<OrganizationItem> => {
    return await executeAuthRequest<OrganizationItem>(`/organizations/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

export { ApiError };
