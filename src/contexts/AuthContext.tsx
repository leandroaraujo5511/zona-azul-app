import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginRequest, RegisterRequest, ApiError } from '../types/api';
import { authService } from '../services/auth.service';
import { STORAGE_KEYS } from '../constants/config';
import { EventEmitter } from '../utils/eventEmitter';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

        if (token && storedUser) {
          // First, load user from storage immediately (optimistic)
          try {
            const parsedUser = JSON.parse(storedUser) as User;
            setUser(parsedUser);
          } catch (parseError) {
            console.error('checkSession - error parsing stored user:', parseError);
            // If parsing fails, clear corrupted data
            await AsyncStorage.multiRemove([
              STORAGE_KEYS.TOKEN,
              STORAGE_KEYS.REFRESH_TOKEN,
              STORAGE_KEYS.USER,
            ]);
            setUser(null);
            setIsLoading(false);
            return;
          }

          // Then verify token is still valid by fetching current user (in background)
          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              // Update with fresh data from server
              setUser(currentUser);
              await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
            }
          } catch {
            // If validation fails, keep the stored user
            // Don't clear storage on validation failure - could be network error
            // The user will be logged out only when they actually try to use an API that requires auth
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('checkSession - unexpected error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for token expiration events from API interceptor
    const handleTokenExpired = async () => {
      setUser(null);
      // Storage is already cleared by the interceptor
    };

    EventEmitter.on('auth:token-expired', handleTokenExpired);

    return () => {
      EventEmitter.off('auth:token-expired', handleTokenExpired);
    };
  }, []);

  const login = async (
    credentials: LoginRequest
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);

      // Store tokens first
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

      // Fetch full user data to match User type
      let fullUser: User | null = null;
      try {
        fullUser = await authService.getCurrentUser();
        // If successful, store the full user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fullUser));
        setUser(fullUser);
      } catch {
        // If getCurrentUser fails (network error, token invalid, etc.), use the user from login response as fallback
        // This ensures the login still succeeds even if we can't fetch full user details immediately
        const mappedUser: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          avatar: response.user.avatar,
          emailVerified: false,
          phoneVerified: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser));
        setUser(mappedUser);
        fullUser = mappedUser;
      }

      // Validate user role - allow fiscal, driver, and admin roles
      const userToValidate = fullUser || response.user;
      if (
        userToValidate.role !== 'fiscal' &&
        userToValidate.role !== 'driver' &&
        userToValidate.role !== 'admin'
      ) {
        // Clear tokens if role is not allowed
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER,
        ]);
        setUser(null);
        setIsLoading(false);
        return {
          success: false,
          error: 'Você não tem permissão para acessar este aplicativo.',
        };
      }

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (
    data: RegisterRequest
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);

      console.log('response no context', response);

      // Store tokens first
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

      // Fetch full user data
      try {
        const fullUser = await authService.getCurrentUser();
        // If successful, store the full user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fullUser));
        setUser(fullUser);
      } catch {
        // If getCurrentUser fails (network error, token invalid, etc.), use the user from register response as fallback
        // This ensures the registration still succeeds even if we can't fetch full user details immediately
        const mappedUser: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          avatar: response.user.avatar,
          emailVerified: false,
          phoneVerified: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser));
        setUser(mappedUser);
      }

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const apiError = error as ApiError;
      // The error message is already formatted by authService with specific backend messages
      return {
        success: false,
        error: apiError.message || 'Não foi possível criar a conta. Tente novamente.',
      };
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
      ]);
      setIsLoading(false);
    }
  };

  // Calculate boolean values as primitives
  const isAuthenticated = user !== null;

  // Create context value with explicit primitive types
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

