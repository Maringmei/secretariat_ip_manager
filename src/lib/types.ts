export type Role = 'staff' | 'director' | 'coordinator' | 'admin';

export type RequestStatus = 'Pending' | 'Assigned' | 'Pending Approval' | 'Approved' | 'Reverted' | 'Completed';

// Based on /api/auth/verify-otp response
export interface User {
  id: number;
  name: string;
  designation: string;
  type: 'official' | 'requester';
  access?: string[];
  // Deprecated fields from old mock data, kept for compatibility for now
  firstName?: string;
  lastName?: string;
  department?: string; // departmentId
  reportingOfficer?: string;
  einOrSin?: string;
  ein_sin?: string;
  eofficeOnboarded?: boolean;
  email?: string;
  whatsappNo?: string;
  whatsapp_no?: string;
  role?: Role;
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
  id: string;
  userId: string | number;
  macAddress: string;
  roomNo: string;
  block: string; // blockId
  status: RequestStatus;
  requestedAt: Date;
  privateIp?: string;
  connectionSpeed?: string; // speedId
  workflow: WorkflowStep[];
}
