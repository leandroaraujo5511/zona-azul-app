import api from './api';
import { Zone, GetZonesQuery, ApiError } from '../types/api';

class ZoneService {
  /**
   * Get all zones
   */
  async getAllZones(query?: GetZonesQuery): Promise<{ data: Zone[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();
      if (query?.status) params.append('status', query.status);
      if (query?.latitude) params.append('latitude', query.latitude.toString());
      if (query?.longitude) params.append('longitude', query.longitude.toString());
      if (query?.radius) params.append('radius', query.radius.toString());
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());

      const url = `/zones${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<{ data: Zone[]; pagination?: any }>(url);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar zonas',
      };
      throw apiError;
    }
  }

  /**
   * Get zone by ID
   */
  async getZoneById(id: string): Promise<Zone> {
    try {
      const response = await api.get<Zone>(`/zones/${id}`);
      // Backend retorna a zona diretamente
      const zone = response.data;
      if (!zone) {
        throw new Error('Zona não encontrada');
      }
      return zone;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar zona',
      };
      throw apiError;
    }
  }
}

export const zoneService = new ZoneService();

