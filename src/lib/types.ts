

export type Role = 'staff' | 'director' | 'coordinator' | 'admin' | string;

export type RequestStatus = 'Pending' | 'Assigned' | 'Pending Approval' | 'Approved' | 'Reverted' | 'Completed' | 'New';

// Based on /api/auth/verify-otp response
export interface User {
  id: number;
  name: string;
  designation: string;
  type?: 'official' | 'requester';
  access?: string[];
  // from profile API
  department_name?: string;
  department_id?: number;
  // from login response or user list
  role?: Role;

  // from profile form/API
  department?: string; // departmentId
  ein_sin?: string;
  email?: string;
  whatsapp_no?: string;
  profileComplete?: boolean;
  first_name?: string;
  last_name?: string;
  eofficeOnboarded?: boolean;
  username?: string;
}

export interface SettingItem {
    id: number | string;
    name: string;
}

export interface Department extends SettingItem {}

export interface Block extends SettingItem {}

export interface Floor extends SettingItem {}

export interface ConnectionSpeed extends SettingItem {
  speed?: string; // e.g., '10 Mbps', '100 Mbps'
}

export interface NetworkEngineer extends SettingItem {}

export interface WorkflowStep {
  step: string;
  timestamp: Date | string; // Allow string to handle API response
  actor: string; // User's name
  remarks?: string;
}

export interface Request {
  // Common fields from list view
  id: number;
  request_number: number;
  first_name: string;
  last_name: string;
  designation: string;
  department_name: string;
  created_at: string;
  status_name: RequestStatus;
  status_foreground_color: string;
  status_background_color: string;
  requestedAt: Date; // Manually added client-side for convenience

  // Fields for details view
  reporting_officer?: string;
  ein_sin?: string;
  mobile_no?: string;
  email?: string;
  mac_address?: string;
  block_name?: string;
  section?: string;
  room_no?: string;
  e_office_onboarded?: '0' | '1';
  status_id?: string;
  ip_address?: string;
  connection_speed?: string;
  can_approve?: boolean;
  can_close?: boolean;
  can_assign_network_engineer? : boolean; 
  service_time? : string;
  service_time_label? : string;


  // Fields for table view (might be deprecated if details are always fetched)
  userId?: string | number;
  block?: string; // blockId
  status?: RequestStatus; // Old status field, for compatibility
  workflow?: WorkflowStep[];
}

export interface Status {
  id: number;
  name: string;
  foreground_color: string;
  background_color: string;
}
