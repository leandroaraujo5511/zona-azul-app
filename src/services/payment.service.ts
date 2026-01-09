import api from './api';
import { ApiError } from '../types/api';

export interface Payment {
  id: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  expiresAt: string | null;
  qrCode?: string;
  qrCodeText?: string;
}

class PaymentService {
  /**
   * Get payment by ID
   * GET /api/v1/payments/:id
   */
  async getPaymentById(id: string): Promise<Payment> {
    try {
      const response = await api.get<Payment>(`/payments/${id}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar pagamento',
      };
      throw apiError;
    }
  }
}

export const paymentService = new PaymentService();

