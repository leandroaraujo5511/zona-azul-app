// API Configuration
export const API_BASE_URL = __DEV__
	? "https://api.zona-azul.guaribasdev.com.br/api/v1/" // Production
	: "http://192.168.0.85:3000/api/v1"; // Development - ajuste conforme necessário

export const STORAGE_KEYS = {
	TOKEN: "@zonaazul:token",
	REFRESH_TOKEN: "@zonaazul:refreshToken",
	USER: "@zonaazul:user",
} as const;

export const APP_VERSION = "1.0.3";
