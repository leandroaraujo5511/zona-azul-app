import api from './api';
import { ApiError } from '../types/api';

export type NotificationStatus =
  | 'pending'
  | 'recognized'
  | 'paid'
  | 'expired'
  | 'converted'
  | 'cancelled';

export interface NotificationLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface CreateNotificationInput {
  plate: string;
  location?: NotificationLocation;
  observations?: string;
}

export interface Notification {
  id: string;
  notificationNumber: string;
  plate: string;
  status: NotificationStatus;
  amount: number;
  expiresAt: string;
  createdAt: string;
  paidAt?: string;
  convertedToFineAt?: string;
  location?: NotificationLocation;
  observations?: string;
  fiscal?: {
    id: string;
    name: string;
    email: string;
  };
  vehicle?: {
    id: string;
    plate: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ListNotificationsQuery {
  status?: NotificationStatus;
  plate?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class NotificationService {
  /**
   * Create notification (Fiscal/Admin)
   */
  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    try {
      const response = await api.post<{ data: Notification }>('/notifications', input);
      return response.data.data || response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao criar notificação',
      };
      throw apiError;
    }
  }

  /**
   * List notifications (Fiscal/Admin)
   */
  async listNotifications(query?: ListNotificationsQuery): Promise<NotificationListResponse> {
    try {
      const params = new URLSearchParams();
      if (query?.status) params.append('status', query.status);
      if (query?.plate) params.append('plate', query.plate);
      if (query?.startDate) params.append('startDate', query.startDate);
      if (query?.endDate) params.append('endDate', query.endDate);
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());

      const url = `/notifications${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<NotificationListResponse>(url);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao listar notificações',
      };
      throw apiError;
    }
  }

  /**
   * Get notification by ID
   * Since backend doesn't have a direct endpoint, we search in the list
   */
  async getNotificationById(id: string): Promise<Notification> {
    try {
      // Search in all notifications (with high limit to find the one we need)
      // In a real scenario, we'd want a dedicated endpoint, but this works for now
      const response = await api.get<NotificationListResponse>('/notifications?limit=1000');
      const notification = response.data.data.find((n) => n.id === id);
      
      if (!notification) {
        throw new Error('Notificação não encontrada');
      }
      
      return notification;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar notificação',
      };
      throw apiError;
    }
  }
}

export const notificationService = new NotificationService();

