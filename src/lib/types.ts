
export type Role = 'staff' | 'director' | 'coordinator' | 'admin';

export type RequestStatus = 'Pending' | 'Assigned' | 'Pending Approval' | 'Approved' | 'Reverted' | 'Completed' | 'New';

// Based on /api/auth/verify-otp response
export interface User {
  id: number;
  name: string;
  designation: string;
  type: 'official' | 'requester';
  access?: string[];
  // from profile API
  department_name?: string;
  // Deprecated fields from old mock data, kept for compatibility for now
  department?: string; // departmentId
  ein_sin?: string;
  email?: string;
  whatsapp_no?: string;
  profileComplete?: boolean;
  first_name?: string;
  last_name?: string;
}

export interface Department {
  id: number | string;
  name: string;
}

export interface Block {
  id: number | string;
  name: string;
}

export interface ConnectionSpeed {
  id: number | string;
  speed?: string; // e.g., '10 Mbps', '100 Mbps'
  name: string; // for compatibility with api response
}

export interface WorkflowStep {
  step: string;
  timestamp: Date;
  actor: string; // User's name
  remarks?: string;
}

export interface Request {
  // Common fields
  id: number;
  request_number: number;
  first_name: string;
  last_name: string;
  designation: string;
  department_name: string;
  room_no: string;
  section: string;
  block_name: string;
  e_office_onboarded: '0' | '1';
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
  status_id?: number;
  ip_address?: string;
  connection_speed?: string;
  can_approve?: boolean;

  // Fields for table view (might be deprecated if details are always fetched)
  userId?: string | number;
  block?: string; // blockId
  status: RequestStatus;
  privateIp?: string;
  connectionSpeed?: string; // speedId
  workflow?: WorkflowStep[];
}
