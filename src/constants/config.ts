// API Configuration
export const API_BASE_URL = __DEV__
  ? 'http://192.168.18.188:3000/api/v1' // Development - ajuste conforme necessário
  : 'https://api.zona-azul.guaribasdev.com.br/api/v1/'; // Production
  
export const STORAGE_KEYS = {
  TOKEN: '@zonaazul:token',
  REFRESH_TOKEN: '@zonaazul:refreshToken',
  USER: '@zonaazul:user',
} as const;


export const APP_VERSION = '1.0.2';

