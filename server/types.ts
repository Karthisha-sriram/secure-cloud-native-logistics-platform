export type Role = 'ADMIN' | 'OPERATIONS_MANAGER' | 'CUSTOMER';

export type ShipmentStatus =
  | 'CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_FACILITY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'CANCELLED';

export type ShipmentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DocumentType =
  | 'INVOICE'
  | 'BILL_OF_LADING'
  | 'CUSTOMS_DECLARATION'
  | 'DELIVERY_RECEIPT'
  | 'CERTIFICATE';

export type NotificationType =
  | 'SHIPMENT_STATUS'
  | 'SHIPMENT_DELAYED'
  | 'DELIVERY_COMPLETED'
  | 'DOCUMENT_UPLOADED'
  | 'SECURITY_ALERT'
  | 'SYSTEM';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  phone: string;
  company: string;
  customerId?: string; // If customer role, linked to Customer entity
  avatarUrl: string;
  createdAt: string;
  lastLoginAt: string;
  status: 'ACTIVE' | 'LOCKED' | 'DISABLED';
  preferences: {
    theme: 'light' | 'dark';
    emailAlerts: boolean;
    smsAlerts: boolean;
    language: string;
  };
}

export interface CustomerRecord {
  id: string; // CUST-1001
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  country: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  notes?: string;
}

export interface ShipmentEventRecord {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location: string;
  description: string;
  performedByUserId: string;
  performedByName: string;
  timestamp: string;
}

export interface ShipmentRecord {
  id: string; // SHP-10021
  customerId: string;
  customerName: string;
  origin: string;
  destination: string;
  packageDescription: string;
  weightKg: number;
  dimensions: string; // e.g. "120x80x160 cm"
  priority: ShipmentPriority;
  currentStatus: ShipmentStatus;
  expectedDeliveryDate: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
}

export interface DocumentRecord {
  id: string; // DOC-2026-001
  shipmentId?: string;
  customerId?: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  documentType: DocumentType;
  storagePath: string;
  storageProvider: 'local' | 'gcs';
  uploadedByUserId: string;
  uploadedByName: string;
  uploadedAt: string;
}

export interface NotificationRecord {
  id: string;
  recipientUserId?: string; // or null for all operations/admin
  roleTarget?: Role;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  linkTo?: string;
  createdAt: string;
}

export interface SecurityEventRecord {
  id: string;
  userId?: string;
  userEmail: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'PASSWORD_CHANGED' | 'UNAUTHORIZED_ACCESS' | 'SESSION_REVOKED';
  ipAddress: string;
  userAgent: string;
  details: string;
  timestamp: string;
}

export interface UserSessionRecord {
  id: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  device: string;
  lastActive: string;
  isCurrent?: boolean;
}
