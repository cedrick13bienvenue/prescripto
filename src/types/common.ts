// Common types and enums used across the application

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  PHARMACIST = 'pharmacist',
}

export enum VisitType {
  CONSULTATION = 'consultation',
  EMERGENCY = 'emergency',
  FOLLOWUP = 'followup',
}

export enum PrescriptionStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
}

export type Gender = 'male' | 'female' | 'other';

// Common API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
  };
}

// Pagination interface
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// Search parameters
export interface SearchParams {
  query: string;
  limit?: number;
}

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User base interface
export interface UserBase {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
}
