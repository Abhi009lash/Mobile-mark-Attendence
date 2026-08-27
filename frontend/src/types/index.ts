export type UserRole =
  | "super_admin"
  | "organization_owner"
  | "hr_admin"
  | "attendance_admin"
  | "branch_manager"
  | "employee";

export type AttendanceStatus =
  | "present"
  | "late"
  | "half_day"
  | "absent"
  | "on_leave";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type RegularizationType =
  | "missed_check_in"
  | "missed_check_out"
  | "missed_both"
  | "on_duty"
  | "late_waiver";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  organization_id?: number;
  branch_id?: number;
  status: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // 900 seconds (15 minutes)
}

export interface AuthResponse extends AuthTokens {
  user_id: number;
  email: string;
  name: string;
  role: UserRole;
  organization_id?: number;
  branch_id?: number;
}

export interface AttendanceRecord {
  id: number;
  organization_id: number;
  employee_id: number;
  location_id?: number;
  date: string;
  check_in?: string;
  check_out?: string;
  check_in_latitude?: number;
  check_in_longitude?: number;
  check_out_latitude?: number;
  check_out_longitude?: number;
  status: AttendanceStatus;
  source: string;
  created_at: string;
}

export interface AttendanceRegularization {
  id: number;
  organization_id: number;
  employee_id: number;
  attendance_id?: number;
  request_type: RegularizationType;
  attendance_date: string;
  requested_check_in?: string;
  requested_check_out?: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approved_by?: number;
  rejection_reason?: string;
  created_at: string;
}

export interface Shift {
  id: number;
  organization_id: number;
  branch_id?: number;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
  is_night_shift: boolean;
  status: string;
}

export interface Holiday {
  id: number;
  organization_id: number;
  branch_id?: number;
  name: string;
  date: string;
}

export interface NotificationResponse {
  id: number;
  organization_id: number;
  user_id: number;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface LeaveRequest {
  id: number;
  organization_id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
  status: LeaveStatus;
  approved_by?: number;
  created_at: string;
  leave_type?: {
    id: number;
    name: string;
    days_allowed: number;
  };
}

export interface EmployeeProfile {
  id: number;
  user_id: number;
  organization_id: number;
  branch_id?: number;
  employee_code: string;
  designation?: string;
  joining_date?: string;
  status: string;
}

export interface LocationItem {
  id: number;
  organization_id: number;
  branch_id?: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  status: string;
}
