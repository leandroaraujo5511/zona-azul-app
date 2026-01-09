import api from './api';
import { LoginRequest, RegisterRequest, LoginResponse, User, ApiError } from '../types/api';

/**
 * Format error message from API response
 * Handles validation errors with details and other error types
 */
function formatErrorMessage(error: any): string {
  const apiError: ApiError = error.response?.data?.error;

  if (!apiError) {
    return error.message || 'Erro ao processar solicitação';
  }

  // Handle validation errors with details
  if (apiError.code === 'VALIDATION_ERROR' && apiError.details) {
    const details = apiError.details as { field: string; message: string }[];
    if (details && details.length > 0) {
      // Format multiple validation errors
      const errorMessages = details.map((detail) => {
        const fieldName = detail.field
          .split('.')
          .map((part) => {
            // Map common field names to user-friendly names
            const fieldMap: { [key: string]: string } = {
              email: 'E-mail',
              password: 'Senha',
              confirmPassword: 'Confirmar senha',
              name: 'Nome',
              phone: 'Telefone',
              cpf: 'CPF',
            };
            return fieldMap[part] || part.charAt(0).toUpperCase() + part.slice(1);
          })
          .join(' ');
        return `${fieldName}: ${detail.message}`;
      });
      return errorMessages.join('\n');
    }
  }

  // Return the specific error message from backend
  return apiError.message || 'Erro ao processar solicitação';
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<{ data: LoginResponse }>('/auth/login', credentials);
      return response.data as unknown as LoginResponse;
    } catch (error: any) {
      const formattedMessage = formatErrorMessage(error);
      const apiError: ApiError = error.response?.data?.error || {
        message: formattedMessage,
      };
      // Override message with formatted message
      apiError.message = formattedMessage;
      throw apiError;
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<{ data: LoginResponse }>('/auth/register', data);
      return response.data as unknown as LoginResponse;
    } catch (error: any) {
      const formattedMessage = formatErrorMessage(error);
      const apiError: ApiError = error.response?.data?.error || {
        message: formattedMessage,
      };
      // Override message with formatted message
      apiError.message = formattedMessage;
      throw apiError;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<{ data: User }>('/users/me');
      return response.data.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao buscar usuário',
      };
      throw apiError;
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Even if logout fails on server, we still want to clear local storage
      console.error('Logout error:', error);
    }
  }

  /**
   * Refresh access token
   * Note: Backend returns { token, expiresIn } directly, not wrapped in { data: ... }
   * Refresh token is not renewed and remains the same
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    try {
      const response = await api.post<{ token: string; expiresIn: number }>(
        '/auth/refresh-token',
        { refreshToken }
      );
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data?.error || {
        message: error.message || 'Erro ao atualizar token',
      };
      throw apiError;
    }
  }
}

export const authService = new AuthService();




