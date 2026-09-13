import { executeAuthRequest } from './auth';

export interface AdminItem {
  id: string;
  organization_id: string;
  organization_name?: string | null;
  organization_code?: string | null;
  organization_logo_url?: string | null;
  email: string;
  full_name: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

export interface AdminListResponse {
  total: number;
  page: number;
  page_size: number;
  items: AdminItem[];
}

export interface AdminCreatePayload {
  full_name: string;
  email: string;
  password: string;
}

export interface AdminStatusUpdatePayload {
  status: 'ACTIVE' | 'SUSPENDED';
}

export const adminsApi = {
  list: async (params?: {
    search?: string;
    org_id?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<AdminListResponse> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.org_id) query.append('org_id', params.org_id);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.page_size) query.append('page_size', String(params.page_size));

    const qs = query.toString();
    const endpoint = qs ? `/platform/admins?${qs}` : '/platform/admins';
    return await executeAuthRequest<AdminListResponse>(endpoint, {
      method: 'GET',
    });
  },

  create: async (orgId: string, payload: AdminCreatePayload): Promise<AdminItem> => {
    return await executeAuthRequest<AdminItem>(`/organizations/${orgId}/admins`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateStatus: async (adminId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<AdminItem> => {
    return await executeAuthRequest<AdminItem>(`/platform/admins/${adminId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (adminId: string): Promise<{ message: string }> => {
    return await executeAuthRequest<{ message: string }>(`/platform/admins/${adminId}`, {
      method: 'DELETE',
    });
  },
};
