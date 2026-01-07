import api from './api';
import { Vehicle, CreateVehicleRequest, UpdateVehicleRequest, ApiError } from '../types/api';

class VehicleService {
  /**
   * Get all vehicles for current user
   */
  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const response = await api.get<{ data: Vehicle[] }>('/vehicles');
      return response.data.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar veículos',
      };
      throw apiError;
    }
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(id: string): Promise<Vehicle> {
    try {
      const response = await api.get<Vehicle>(`/vehicles/${id}`);
      // Backend retorna direto o vehicle, não dentro de { data: ... }
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar veículo',
      };
      throw apiError;
    }
  }

  /**
   * Create vehicle
   */
  async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
    try {
      const response = await api.post<Vehicle>('/vehicles', data);
      // Backend retorna direto o vehicle
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao criar veículo',
      };
      throw apiError;
    }
  }

  /**
   * Update vehicle
   */
  async updateVehicle(id: string, data: UpdateVehicleRequest): Promise<Vehicle> {
    try {
      const response = await api.put<Vehicle>(`/vehicles/${id}`, data);
      // Backend retorna direto o vehicle
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao atualizar veículo',
      };
      throw apiError;
    }
  }

  /**
   * Delete vehicle
   */
  async deleteVehicle(id: string): Promise<void> {
    try {
      await api.delete(`/vehicles/${id}`);
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao excluir veículo',
      };
      throw apiError;
    }
  }
}

export const vehicleService = new VehicleService();

