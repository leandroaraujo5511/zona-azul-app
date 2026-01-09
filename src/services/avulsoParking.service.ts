import api from './api';
import {
  ApiError,
  Parking,
  AccountabilityStatsResponse,
  SettleParkingResponse,
} from '../types/api';

export interface UserByPlate {
  userId: string; // Backend returns userId, not id
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  balance: number;
  vehicleId?: string; // Optional: vehicle ID
}

export interface CreateAvulsoParkingInput {
  plate: string;
  zoneId: string;
  requestedMinutes: number;
  userId?: string; // Optional: if provided, use this user
}

export interface CreateAvulsoParkingPixInput {
  plate: string;
  zoneId: string;
  requestedMinutes: number;
  cpf: string;
}

export interface CreateAvulsoParkingCashInput {
  plate: string;
  zoneId: string;
  requestedMinutes: number;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  observations?: string;
}

class AvulsoParkingService {
  /**
   * Get users by plate (Fiscal/Admin)
   * GET /api/v1/vehicles/:plate/users
   */
  async getUsersByPlate(plate: string): Promise<UserByPlate[]> {
    try {
      const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const response = await api.get<{ found: boolean; users: UserByPlate[] }>(
        `/vehicles/${normalizedPlate}/users`
      );
      // Backend returns { found: boolean, users: UserByPlate[] } directly
      const result = response.data;
      if (result && typeof result === 'object' && 'users' in result) {
        return result.users || [];
      }
      // Fallback: if response is already an array
      return Array.isArray(result) ? result : [];
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar usuários por placa',
      };
      throw apiError;
    }
  }

  /**
   * Create avulso parking with user balance (Fiscal/Admin)
   * POST /api/v1/parkings/avulso
   */
  async createAvulsoParkingWithUser(
    input: CreateAvulsoParkingInput
  ): Promise<Parking> {
    try {
      const normalizedPlate = input.plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const response = await api.post<Parking>('/parkings/avulso', {
        plate: normalizedPlate,
        zoneId: input.zoneId,
        requestedMinutes: input.requestedMinutes,
        userId: input.userId,
      });
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao criar estacionamento avulso',
      };
      throw apiError;
    }
  }

  /**
   * Create avulso parking via PIX (Fiscal/Admin)
   * POST /api/v1/parkings/avulso/pix
   */
  async createAvulsoParkingPix(
    input: CreateAvulsoParkingPixInput
  ): Promise<{ parking: Parking; payment: any }> {
    try {
      const normalizedPlate = input.plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const normalizedCpf = input.cpf.replace(/[^0-9]/g, '');
      const response = await api.post<{ parking: Parking; payment: any }>(
        '/parkings/avulso/pix',
        {
          plate: normalizedPlate,
          zoneId: input.zoneId,
          requestedMinutes: input.requestedMinutes,
          cpf: normalizedCpf,
        }
      );
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao criar estacionamento avulso via PIX',
      };
      throw apiError;
    }
  }

  /**
   * Create avulso parking via cash (Fiscal/Admin)
   * POST /api/v1/parkings/avulso/cash
   */
  async createAvulsoParkingCash(
    input: CreateAvulsoParkingCashInput
  ): Promise<Parking> {
    try {
      const normalizedPlate = input.plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const response = await api.post<Parking>('/parkings/avulso/cash', {
        plate: normalizedPlate,
        zoneId: input.zoneId,
        requestedMinutes: input.requestedMinutes,
        location: input.location,
        observations: input.observations,
      });
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao criar estacionamento avulso via dinheiro',
      };
      throw apiError;
    }
  }

  /**
   * Cancel avulso parking (Fiscal/Admin)
   * POST /api/v1/parkings/avulso/:id/cancel
   */
  async cancelAvulsoParking(id: string): Promise<{ parking: Parking; message: string }> {
    try {
      const response = await api.post<{ parking: Parking; message: string }>(
        `/parkings/avulso/${id}/cancel`
      );
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao cancelar estacionamento avulso',
      };
      throw apiError;
    }
  }

  /**
   * Get avulso parking by ID (Fiscal/Admin)
   * GET /api/v1/parkings/:id (works for avulso parkings created by fiscal)
   */
  async getAvulsoParkingById(id: string): Promise<Parking> {
    try {
      const response = await api.get<Parking>(`/parkings/${id}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar estacionamento avulso',
      };
      throw apiError;
    }
  }

  /**
   * Get accountability statistics (Fiscal/Admin)
   * GET /api/v1/fiscal/accountability
   */
  async getAccountabilityStats(query?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AccountabilityStatsResponse> {
    try {
      const response = await api.get<AccountabilityStatsResponse>('/fiscal/accountability', {
        params: query,
      });
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar estatísticas de prestação de contas',
      };
      throw apiError;
    }
  }

  /**
   * Settle avulso parking (mark as accounted) (Fiscal/Admin)
   * POST /api/v1/parkings/avulso/:id/settle
   */
  async settleAvulsoParking(id: string): Promise<SettleParkingResponse> {
    try {
      const response = await api.post<SettleParkingResponse>(`/parkings/avulso/${id}/settle`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao marcar estacionamento como prestado',
      };
      throw apiError;
    }
  }
}

export const avulsoParkingService = new AvulsoParkingService();

