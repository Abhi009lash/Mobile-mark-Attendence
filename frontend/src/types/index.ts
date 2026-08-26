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

export interface EmployeeProfile {
  id: number;
  organization_id: number;
  user_id: number;
  branch_id?: number;
  employee_code: string;
  designation?: string;
  joining_date?: string;
  status: string;
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

export interface LocationItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  branch_id?: number;
  status: string;
}

export interface LeaveType {
  id: number;
  name: string;
  days_allowed: number;
  status: string;
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
  created_at: string;
  leave_type?: LeaveType;
}

export interface OfflineAttendanceQueueItem {
  client_id: string;
  employee_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  check_in_latitude?: number;
  check_in_longitude?: number;
  check_out_latitude?: number;
  check_out_longitude?: number;
  location_id?: number;
  synced: number; // 0 = pending, 1 = synced
}
