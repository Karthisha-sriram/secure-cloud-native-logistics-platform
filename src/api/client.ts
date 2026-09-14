import {
  User,
  Shipment,
  Customer,
  DocumentItem,
  NotificationItem,
  SecurityEvent,
  UserSession,
  PaginatedResponse,
  AnalyticsOverview,
  ShipmentStatus,
} from '../types';

const TOKEN_KEY = 'logistics_auth_jwt_token';

class ApiClient {
  private getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText || 'An unexpected error occurred.' };
      }

      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        // Dispatch custom event so AuthContext can handle redirect cleanly
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      const error = new Error(errorData.message || errorData.error || 'API Request Failed');
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // Token Helpers
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await this.handleResponse<{ token: string; user: User }>(res);
    this.setToken(data.token);
    return data;
  }

  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ user: User }>(res);
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      this.clearToken();
    }
  }

  // Health
  async checkHealth() {
    const res = await fetch('/actuator/health');
    return this.handleResponse<{ status: string; components: any }>(res);
  }

  // Shipments
  async getShipments(params?: {
    search?: string;
    status?: string;
    priority?: string;
    origin?: string;
    destination?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Shipment>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
          query.append(k, String(v));
        }
      });
    }
    const res = await fetch(`/api/shipments?${query.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PaginatedResponse<Shipment>>(res);
  }

  async getShipmentById(id: string): Promise<Shipment> {
    const res = await fetch(`/api/shipments/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Shipment>(res);
  }

  async createShipment(data: Partial<Shipment>): Promise<Shipment> {
    const res = await fetch('/api/shipments', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Shipment>(res);
  }

  async updateShipment(id: string, data: Partial<Shipment>): Promise<Shipment> {
    const res = await fetch(`/api/shipments/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Shipment>(res);
  }

  async updateShipmentStatus(id: string, statusData: { status: ShipmentStatus; location: string; description: string }): Promise<{ shipment: Shipment; events: any[] }> {
    const res = await fetch(`/api/shipments/${id}/status`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(statusData),
    });
    return this.handleResponse<{ shipment: Shipment; events: any[] }>(res);
  }

  async deleteShipment(id: string): Promise<void> {
    const res = await fetch(`/api/shipments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // Customers
  async getCustomers(params?: { search?: string; page?: number; size?: number; sortBy?: string }): Promise<PaginatedResponse<Customer>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const res = await fetch(`/api/customers?${query.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PaginatedResponse<Customer>>(res);
  }

  async getCustomerById(id: string): Promise<Customer & { shipments: Shipment[]; stats: any }> {
    const res = await fetch(`/api/customers/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Customer & { shipments: Shipment[]; stats: any }>(res);
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Customer>(res);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Customer>(res);
  }

  async deleteCustomer(id: string): Promise<void> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // Documents
  async getDocuments(params?: { shipmentId?: string; documentType?: string; search?: string }): Promise<{ documents: DocumentItem[]; total: number; storageProvider: string }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
          query.append(k, String(v));
        }
      });
    }
    const res = await fetch(`/api/documents?${query.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ documents: DocumentItem[]; total: number; storageProvider: string }>(res);
  }

  async uploadDocument(formData: FormData): Promise<DocumentItem> {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    });
    return this.handleResponse<DocumentItem>(res);
  }

  async downloadDocument(id: string, fileName: string): Promise<void> {
    const token = this.getToken();
    const res = await fetch(`/api/documents/${id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      throw new Error('Failed to download document.');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number; total: number }> {
    const res = await fetch('/api/notifications', {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ notifications: NotificationItem[]; unreadCount: number; total: number }>(res);
  }

  async markNotificationRead(id: string): Promise<void> {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  async markAllNotificationsRead(): Promise<void> {
    const res = await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const res = await fetch('/api/analytics/overview', {
      headers: this.getHeaders(),
    });
    return this.handleResponse<AnalyticsOverview>(res);
  }

  // Profile
  async getProfile(): Promise<User> {
    const res = await fetch('/api/profile', {
      headers: this.getHeaders(),
    });
    return this.handleResponse<User>(res);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(res);
  }

  // Security
  async getSecurityEvents(): Promise<{ events: SecurityEvent[]; total: number }> {
    const res = await fetch('/api/security/events', {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ events: SecurityEvent[]; total: number }>(res);
  }

  async getSessions(): Promise<UserSession[]> {
    const res = await fetch('/api/security/sessions', {
      headers: this.getHeaders(),
    });
    return this.handleResponse<UserSession[]>(res);
  }

  async revokeSession(id: string): Promise<void> {
    const res = await fetch(`/api/security/sessions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  async logoutAllSessions(): Promise<void> {
    const res = await fetch('/api/security/logout-all', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const res = await fetch('/api/security/change-password', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string }>(res);
  }

  // AI Assistant
  async askAI(query: string): Promise<{ query: string; response: string; timestamp: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ query }),
    });
    return this.handleResponse<{ query: string; response: string; timestamp: string }>(res);
  }
}

export const api = new ApiClient();
