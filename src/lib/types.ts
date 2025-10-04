export type Role = 'staff' | 'director' | 'coordinator' | 'admin';

export type RequestStatus = 'Pending' | 'Assigned' | 'Pending Approval' | 'Approved' | 'Reverted' | 'Completed';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string; // departmentId
  reportingOfficer: string;
  einOrSin: string;
  eofficeOnboarded: boolean;
  email: string;
  whatsappNo: string;
  role: Role;
  profileComplete: boolean;
}

export interface Department {
  id: string;
  name: string;
}

export interface Block {
  id: string;
  name: string;
}

export interface ConnectionSpeed {
  id: string;
  speed: string; // e.g., '10 Mbps', '100 Mbps'
}

export interface WorkflowStep {
  step: string;
  timestamp: Date;
  actor: string; // User's name
  remarks?: string;
}

export interface Request {
  id: string;
  userId: string;
  macAddress: string;
  roomNo: string;
  block: string; // blockId
  status: RequestStatus;
  requestedAt: Date;
  privateIp?: string;
  connectionSpeed?: string; // speedId
  workflow: WorkflowStep[];
}
