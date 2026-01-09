import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/config';
import { ApiError } from '../types/api';
import { EventEmitter } from '../utils/eventEmitter';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate axios instance for refresh token (without interceptors to avoid circular dependency)
const refreshApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Routes that should not trigger token refresh
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout'];

// Token refresh state management
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - Add token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      url?: string;
    };

    // Skip refresh for authentication routes
    const isAuthRoute = originalRequest.url
      ? AUTH_ROUTES.some((route) => originalRequest.url!.includes(route))
      : false;

    // If error is 401 and we haven't retried yet and it's not an auth route
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          // No refresh token, clear storage and reject
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER,
          ]);
          const noRefreshTokenError = new Error('No refresh token available');
          processQueue(noRefreshTokenError, null);
          isRefreshing = false;
          // Notify AuthContext that token was cleared
          EventEmitter.emit('auth:token-expired');
          return Promise.reject(noRefreshTokenError);
        }

        // Try to refresh token using the separate axios instance
        // Backend returns { token, expiresIn } directly (not wrapped in { data: ... })
        const response = await refreshApi.post<{ token: string; expiresIn: number }>(
          '/auth/refresh',
          { refreshToken }
        );

        const { token } = response.data;

        // Save new access token (refreshToken remains the same)
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
        // Refresh token is not renewed, keep the existing one

        // Process queued requests
        processQueue(null, token);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError: any) {
        // Refresh failed, clear storage
        console.error('[API Interceptor] Token refresh failed:', {
          message: refreshError.message,
          response: refreshError.response?.data,
          status: refreshError.response?.status,
        });
        
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER,
        ]);

        const refreshFailedError =
          refreshError.response?.data?.error?.message ||
          refreshError.response?.data?.message ||
          refreshError.message ||
          'Token refresh failed';
        const errorObj = new Error(refreshFailedError);

        // Process queued requests with error
        processQueue(errorObj, null);
        isRefreshing = false;

        // Emit event to notify AuthContext that token was cleared
        // This will trigger a re-check of authentication state
        EventEmitter.emit('auth:token-expired');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;




