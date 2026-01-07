// API Types

export type UserRole = 'admin' | 'fiscal' | 'operator' | 'driver';
export type VehicleType = 'car' | 'motorcycle' | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  cpf?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string | null;
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiError {
  code?: string;
  message: string;
  details?: unknown;
  timestamp?: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  plate: string;
  vehicleType: VehicleType;
  nickname?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateVehicleRequest {
  plate: string;
  vehicleType: VehicleType;
  nickname?: string | null;
  isDefault?: boolean;
}

export interface UpdateVehicleRequest {
  nickname?: string | null;
  isDefault?: boolean;
}

export interface Zone {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  pricePerPeriod: number;
  periodMinutes: number;
  maxTimeMinutes: number;
  totalSpots: number;
  occupiedSpots?: number;
  status: 'active' | 'inactive';
  operatingHours?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Parking {
  id: string;
  userId: string;
  vehicleId: string;
  zoneId: string;
  plate: string;
  startTime: string;
  endTime?: string | null;
  expectedEndTime?: string;
  actualEndTime?: string | null;
  requestedMinutes?: number;
  actualMinutes?: number;
  duration?: number;
  amount?: number;
  creditsUsed?: number;
  creditsRefunded?: number;
  timeRemaining?: number; // em minutos
  status: 'active' | 'expiring' | 'expired' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  zone?: {
    id: string;
    name: string;
    address: string;
    code: string;
  };
  vehicle?: {
    id: string;
    plate: string;
    nickname?: string | null;
  };
}

export interface CreateParkingRequest {
  vehicleId: string;
  zoneId: string;
  requestedMinutes: number;
}

export interface GetZonesQuery {
  status?: 'active' | 'inactive';
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface CreditBalance {
  balance: number;
  lastUpdated: string;
}

export interface CreditTransaction {
  id: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  description: string;
  referenceType?: string | null;
  referenceId?: string | null;
  balanceAfter: number;
  paymentMethod?: string | null;
  paymentProvider?: string | null;
  status?: string | null;
  createdAt: string;
}

export interface RechargeRequest {
  amount: number;
  paymentMethod: 'pix' | 'credit_card' | 'debit_card';
}

export interface RechargeResponse {
  payment: {
    id: string;
    amount: number;
    method: 'pix' | 'credit_card' | 'debit_card';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    expiresAt: string;
    qrCode?: string; // Base64 QRCode image (data:image/png;base64,...)
    qrCodeText?: string; // PIX copia-e-cola code (brCode)
    paymentUrl?: string;
    providerTransactionId?: string;
  };
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  method: 'pix' | 'credit_card' | 'debit_card';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  qrCode?: string | null;
  qrCodeText?: string | null;
  providerTransactionId?: string | null;
}

