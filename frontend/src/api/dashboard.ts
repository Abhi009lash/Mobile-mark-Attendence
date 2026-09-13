import { executeAuthRequest } from './auth';

export interface KpiStats {
  total_organizations: number;
  total_admins: number;
  total_employees: number;
}

export interface OrgStatusStats {
  active: number;
  trial: number;
  suspended: number;
  total: number;
}

export interface DailyTrendPoint {
  day: number;
  date: string;
  day_label: string;
  organizations: number;
  employees: number;
}

export interface DashboardMetricsResponse {
  selected_year: number;
  selected_month: number;
  kpis: KpiStats;
  organization_status: OrgStatusStats;
  daily_trends: DailyTrendPoint[];
}

export const dashboardApi = {
  getMetrics: async (year?: number, month?: number): Promise<DashboardMetricsResponse> => {
    const query = new URLSearchParams();
    if (year !== undefined) query.append('year', String(year));
    if (month !== undefined) query.append('month', String(month));

    const qs = query.toString();
    const endpoint = qs ? `/platform/dashboard/metrics?${qs}` : '/platform/dashboard/metrics';
    return await executeAuthRequest<DashboardMetricsResponse>(endpoint, {
      method: 'GET',
    });
  },
};
