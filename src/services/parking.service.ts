import api from './api';
import { Parking, CreateParkingRequest, ApiError } from '../types/api';

class ParkingService {
  /**
   * Get all parkings for current user
   */
  async getAllParkings(query?: {
    status?: 'active' | 'expiring' | 'expired' | 'completed' | 'cancelled';
    vehicleId?: string;
    zoneId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Parking[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();
      if (query?.status) params.append('status', query.status);
      if (query?.vehicleId) params.append('vehicleId', query.vehicleId);
      if (query?.zoneId) params.append('zoneId', query.zoneId);
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());

      const url = `/parkings${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<{ data: Parking[]; pagination?: any }>(url);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar estacionamentos',
      };
      throw apiError;
    }
  }

  /**
   * Get active parking for current user
   */
  async getActiveParking(): Promise<Parking | null> {
    try {
      const response = await api.get<Parking>('/parkings/active');
      // Backend retorna o parking diretamente quando existe (status 200)
      // response.data já contém o objeto Parking
      const parking = response.data;
      
      // Validar que temos um objeto válido
      if (!parking || typeof parking !== 'object' || !parking.id) {
        return null;
      }
      
      return parking as Parking;
    } catch (error: any) {
      // If no active parking, backend returns 404 - return null (não é um erro)
      if (error.response?.status === 404) {
        return null;
      }
      
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar estacionamento ativo',
      };
      throw apiError;
    }
  }

  /**
   * Get parking by ID
   */
  async getParkingById(id: string): Promise<Parking> {
    try {
      const response = await api.get<Parking>(`/parkings/${id}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar estacionamento',
      };
      throw apiError;
    }
  }

  /**
   * Create parking
   */
  async createParking(data: CreateParkingRequest): Promise<Parking> {
    try {
      const response = await api.post<Parking>('/parkings', data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao iniciar estacionamento',
      };
      throw apiError;
    }
  }

  /**
   * Renew parking (add additional time)
   */
  async renewParking(id: string, additionalMinutes: number): Promise<Parking> {
    try {
      const response = await api.post<Parking>(`/parkings/${id}/renew`, {
        additionalMinutes,
      });
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao renovar estacionamento',
      };
      throw apiError;
    }
  }

  /**
   * Cancel parking (with refund)
   */
  async cancelParking(id: string): Promise<{ message: string; refund: number }> {
    try {
      const response = await api.post<{ message: string; refund: number }>(
        `/parkings/${id}/cancel`
      );
      // Backend retorna direto
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao cancelar estacionamento',
      };
      throw apiError;
    }
  }

  /**
   * Get parking by plate (Fiscal/Admin only)
   */
  async getParkingByPlate(plate: string): Promise<{
    found: boolean;
    parking: Parking | null;
    canCreateNotification: boolean;
    reason: string | null;
  }> {
    try {
      const response = await api.get<{
        found: boolean;
        parking: Parking | null;
        canCreateNotification: boolean;
        reason: string | null;
      }>(`/parkings/plate/${plate}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar estacionamento por placa',
      };
      throw apiError;
    }
  }
}

export const parkingService = new ParkingService();

