import { UserRole } from './common';

// Authentication related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    patientId?: string; // Only present for patient users
  };
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}
