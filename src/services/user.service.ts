import api from './api';
import { ApiError } from '../types/api';

export interface UserByCpf {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
}

interface UserByCpfResponse {
  found: boolean;
  user: UserByCpf | null;
}

class UserService {
  /**
   * Get user by CPF (Public endpoint)
   * GET /api/v1/users/by-cpf/:cpf
   */
  async getUserByCpf(cpf: string): Promise<UserByCpf | null> {
    try {
      // Remove formatting from CPF
      const normalizedCpf = cpf.replace(/[^0-9]/g, '');
      const response = await api.get<UserByCpfResponse>(`/users/by-cpf/${normalizedCpf}`);
      // Backend returns { found: boolean, user: UserByCpf | null }
      // Extract only the user object
      return response.data.user;
    } catch (error: any) {
      // If user not found (404), return null
      if (error.response?.status === 404) {
        return null;
      }
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar usuário por CPF',
      };
      throw apiError;
    }
  }
}

export const userService = new UserService();

