import api from './api';
import { ParkingByPlateResponse, ApiError } from '../types/api';

class FiscalService {
  /**
   * Get parking by plate (for fiscal inspection)
   */
  async getParkingByPlate(plate: string): Promise<ParkingByPlateResponse> {
    try {
      const response = await api.get<ParkingByPlateResponse>(`/parkings/plate/${plate}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar estacionamento por placa',
      };
      throw apiError;
    }
  }
}

export const fiscalService = new FiscalService();

