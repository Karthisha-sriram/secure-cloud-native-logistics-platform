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

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string;
  company: string;
  customerId?: string;
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

export interface Customer {
  id: string;
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
  activeShipmentsCount?: number;
  totalShipmentsCount?: number;
  deliveredShipmentsCount?: number;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location: string;
  description: string;
  performedByUserId: string;
  performedByName: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  customerId: string;
  customerName: string;
  origin: string;
  destination: string;
  packageDescription: string;
  weightKg: number;
  dimensions: string;
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
  events?: ShipmentEvent[];
  documents?: DocumentItem[];
}

export interface DocumentItem {
  id: string;
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

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  linkTo?: string;
  createdAt: string;
}

export interface SecurityEvent {
  id: string;
  userId?: string;
  userEmail: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'PASSWORD_CHANGED' | 'UNAUTHORIZED_ACCESS' | 'SESSION_REVOKED';
  ipAddress: string;
  userAgent: string;
  details: string;
  timestamp: string;
}

export interface UserSession {
  id: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  device: string;
  lastActive: string;
  isCurrent?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AnalyticsOverview {
  metrics: {
    totalShipments: number;
    inTransit: number;
    outForDelivery: number;
    delivered: number;
    delayed: number;
    pending: number;
    activeCustomers: number;
    totalCustomers: number;
    deliverySuccessRate: number;
    averageDeliveryDays: number;
  };
  statusDistribution: { name: string; value: number; color: string }[];
  volumeOverTime: { month: string; shipments: number; onTime: number; delayed: number }[];
  priorityDistribution: { priority: string; count: number }[];
  regionalActivity: { region: string; shipments: number }[];
}
