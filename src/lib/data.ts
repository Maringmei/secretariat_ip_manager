import type { User, Department, Block, ConnectionSpeed, Request, RequestStatus, Role } from './types';

export const MOCK_USER_STAFF: User = {
  id: 'user-staff-1',
  firstName: 'Manbi',
  lastName: 'Chanu',
  designation: 'Section Officer',
  department: 'dept-home',
  reportingOfficer: 'A. Subhash',
  einOrSin: '10023',
  eofficeOnboarded: true,
  email: 'manbi.c@nic.in',
  whatsappNo: '9876543210',
  role: 'staff',
  profileComplete: true,
};

export const MOCK_USER_DIRECTOR: User = {
    id: 'user-director-1',
    firstName: 'Arambam',
    lastName: 'Subhash',
    designation: 'Joint Director',
    department: 'dept-it',
    reportingOfficer: 'Jane Smith',
    einOrSin: '123456',
    eofficeOnboarded: true,
    email: 'a.subhash@gov.in',
    whatsappNo: '9876543210',
    role: 'director',
    profileComplete: true,
  };

export const MOCK_USER_ADMIN: User = {
    id: 'user-admin-1',
    firstName: 'Sonia',
    lastName: 'Heikrujam',
    designation: 'System Administrator',
    department: 'dept-it',
    reportingOfficer: 'N/A',
    einOrSin: '10001',
    eofficeOnboarded: true,
    email: 'sonia.h@nic.in',
    whatsappNo: '9123456789',
    role: 'admin',
    profileComplete: true,
};

// Set this to the user you want to simulate being logged in
export const MOCK_LOGGED_IN_USER = MOCK_USER_ADMIN; 

export const DEPARTMENTS: Department[] = [
  { id: 'dept-it', name: 'Information Technology' },
  { id: 'dept-home', name: 'Home Affairs' },
  { id: 'dept-finance', name: 'Finance' },
  { id: 'dept-health', name: 'Health and Family Welfare' },
  { id: 'dept-education', name: 'Education' },
];

export const BLOCKS: Block[] = [
  { id: 'block-a', name: 'Block A - North Wing' },
  { id: 'block-b', name: 'Block B - South Wing' },
  { id: 'block-c', name: 'Block C - West Wing' },
  { id: 'block-d', name: 'Block D - East Wing' },
];

export const CONNECTION_SPEEDS: ConnectionSpeed[] = [
    { id: 'speed-10', speed: '10 Mbps' },
    { id: 'speed-50', speed: '50 Mbps' },
    { id: 'speed-100', speed: '100 Mbps' },
    { id: 'speed-1000', speed: '1 Gbps' },
];

export const REQUESTS: Request[] = [
  {
    id: 'REQ001',
    userId: 'user-staff-1',
    macAddress: '00:1B:44:11:3A:B7',
    roomNo: '204',
    block: 'block-a',
    status: 'Approved',
    requestedAt: new Date('2023-10-26T10:00:00Z'),
    privateIp: '10.1.5.23',
    connectionSpeed: 'speed-50',
    workflow: [
        { step: 'Request Submitted', timestamp: new Date('2023-10-26T10:00:00Z'), actor: 'Manbi Chanu' },
        { step: 'IP Assigned', timestamp: new Date('2023-10-26T11:30:00Z'), actor: 'Coordinator' },
        { step: 'Approved', timestamp: new Date('2023-10-27T09:15:00Z'), actor: 'A. Subhash', remarks: 'Approved as per policy.' },
        { step: 'Completed', timestamp: new Date('2023-10-27T09:15:00Z'), actor: 'System' },
    ],
  },
  {
    id: 'REQ002',
    userId: 'user-staff-1',
    macAddress: 'A1:2B:C3:4D:5E:6F',
    roomNo: '312',
    block: 'block-c',
    status: 'Pending Approval',
    requestedAt: new Date('2023-10-28T14:00:00Z'),
    privateIp: '10.1.8.45',
    connectionSpeed: 'speed-100',
    workflow: [
        { step: 'Request Submitted', timestamp: new Date('2023-10-28T14:00:00Z'), actor: 'Manbi Chanu' },
        { step: 'IP Assigned', timestamp: new Date('2023-10-28T16:00:00Z'), actor: 'Coordinator' },
    ],
  },
  {
    id: 'REQ003',
    userId: 'user-director-1',
    macAddress: 'B2:3C:D4:5E:6F:A1',
    roomNo: '101',
    block: 'block-b',
    status: 'Pending',
    requestedAt: new Date('2023-10-29T11:20:00Z'),
    workflow: [
      { step: 'Request Submitted', timestamp: new Date('2023-10-29T11:20:00Z'), actor: 'A. Subhash' },
    ],
  },
    {
    id: 'REQ004',
    userId: 'user-staff-1',
    macAddress: 'C3:4D:E5:6F:A1:B2',
    roomNo: '401',
    block: 'block-d',
    status: 'Reverted',
    requestedAt: new Date('2023-10-25T09:00:00Z'),
    privateIp: '10.1.9.12',
    connectionSpeed: 'speed-10',
    workflow: [
        { step: 'Request Submitted', timestamp: new Date('2023-10-25T09:00:00Z'), actor: 'Manbi Chanu' },
        { step: 'IP Assigned', timestamp: new Date('2023-10-25T10:00:00Z'), actor: 'Coordinator' },
        { step: 'Reverted', timestamp: new Date('2023-10-26T14:00:00Z'), actor: 'A. Subhash', remarks: 'MAC address seems incorrect. Please verify and resubmit.' },
    ],
  },
];
