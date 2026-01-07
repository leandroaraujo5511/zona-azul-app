import api from './api';
import {
  CreditBalance,
  CreditTransaction,
  ApiError,
  RechargeRequest,
  RechargeResponse,
  Payment,
} from '../types/api';

class CreditService {
  /**
   * Get current credit balance
   */
  async getBalance(): Promise<CreditBalance> {
    try {
      const response = await api.get<CreditBalance>('/credits/balance');
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar saldo',
      };
      throw apiError;
    }
  }

  /**
   * Get credit transactions
   */
  async getTransactions(query?: {
    type?: 'credit' | 'debit' | 'refund';
    page?: number;
    limit?: number;
  }): Promise<{ data: CreditTransaction[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();
      if (query?.type) params.append('type', query.type);
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());

      const url = `/credits/transactions${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<{ data: CreditTransaction[]; pagination?: any }>(url);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar transações',
      };
      throw apiError;
    }
  }

  /**
   * Recharge credits
   */
  async recharge(data: RechargeRequest): Promise<RechargeResponse> {
    try {
      const response = await api.post<{ payment: RechargeResponse['payment'] }>('/credits/recharge', data);
      return { payment: response.data.payment };
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao recarregar créditos',
      };
      throw apiError;
    }
  }

  /**
   * Get pending payments (not expired)
   */
  async getPendingPayments(): Promise<{ data: Payment[] }> {
    try {
      const response = await api.get<{ data: Payment[] }>('/payments/pending');
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar pagamentos pendentes',
      };
      throw apiError;
    }
  }
}

export const creditService = new CreditService();




