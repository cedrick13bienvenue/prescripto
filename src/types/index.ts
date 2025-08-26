// User roles enum
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  PHARMACIST = 'pharmacist',
  ADMIN = 'admin'
}

// Gender enum
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

// Prescription status enum
export enum PrescriptionStatus {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

// Visit type enum
export enum VisitType {
  CONSULTATION = 'consultation',
  EMERGENCY = 'emergency',
  FOLLOWUP = 'followup'
}

// Test type enum
export enum TestType {
  BLOOD = 'blood',
  URINE = 'urine',
  XRAY = 'xray',
  MRI = 'mri'
}

// Pharmacy action enum
export enum PharmacyAction {
  SCANNED = 'scanned',
  VALIDATED = 'validated',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected'
}

// Email type enum
export enum EmailType {
  PRESCRIPTION_QR = 'prescription_qr',
  MEDICAL_REPORT = 'medical_report',
  NOTIFICATION = 'notification'
}

// Base interface for all models
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User interface
export interface User extends BaseModel {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
}

// Patient interface
export interface Patient extends BaseModel {
  referenceNumber: string;
  userId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  insuranceDetails?: {
    provider: string;
    policyNumber: string;
  };
  allergies: Allergy[];
  existingConditions: MedicalCondition[];
  emergencyContact: string;
  emergencyPhone: string;
}

// Doctor interface
export interface Doctor extends BaseModel {
  userId: string;
  licenseNumber: string;
  specialization: string;
  hospitalName: string;
  hospitalId: string;
  isVerified: boolean;
}

// Pharmacist interface
export interface Pharmacist extends BaseModel {
  userId: string;
  licenseNumber: string;
  pharmacyName: string;
  pharmacyLicense: string;
  isVerified: boolean;
}

// Prescription interface
export interface Prescription extends BaseModel {
  prescriptionNumber: string;
  patientId: string;
  doctorId: string;
  diagnosis?: string;
  doctorNotes?: string;
  pharmacistNotes?: string;
  status: PrescriptionStatus;
  qrCodeHash: string;
  qrExpiresAt: Date;
  isEmergency: boolean;
  refillCount: number;
  maxRefills: number;
}

// Prescription item interface
export interface PrescriptionItem extends BaseModel {
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  unit: string;
  instructions: string;
  price: number;
  isGenericAllowed: boolean;
}

// Medical history interface
export interface MedicalHistory extends BaseModel {
  patientId: string;
  doctorId: string;
  visitDate: Date;
  visitType: VisitType;
  symptoms?: string;
  diagnosis?: string;
  treatmentNotes?: string;
  vitalSigns?: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    weight?: number;
  };
  recommendations?: string;
}

// Test result interface
export interface TestResult extends BaseModel {
  patientId: string;
  doctorId: string;
  testName: string;
  testType: TestType;
  results: {
    testValues: Record<string, any>;
    normalRanges: Record<string, any>;
  };
  doctorInterpretation?: string;
  testDate: Date;
  labName: string;
  filePath?: string;
}

// Pharmacy log interface
export interface PharmacyLog extends BaseModel {
  prescriptionId: string;
  pharmacistId: string;
  action: PharmacyAction;
  notes?: string;
  itemsDispensed?: Record<string, any>;
  totalAmount?: number;
  paymentMethod?: string;
  actionTimestamp: Date;
}

// QR code interface
export interface QRCode extends BaseModel {
  qrHash: string;
  prescriptionId: string;
  encryptedData: string;
  expiresAt: Date;
  isUsed: boolean;
  scanCount: number;
  lastScanned?: Date;
}

// Email log interface
export interface EmailLog extends BaseModel {
  patientId: string;
  prescriptionId?: string;
  emailType: EmailType;
  recipientEmail: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  sentAt?: Date;
  openedAt?: Date;
}

// Audit log interface
export interface AuditLog extends BaseModel {
  userId: string;
  action: string;
  tableName: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

// System setting interface
export interface SystemSetting extends BaseModel {
  settingKey: string;
  settingValue: string;
  description: string;
  updatedBy: string;
}

// Allergy interface
export interface Allergy {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
  notes?: string;
}

// Medical condition interface
export interface MedicalCondition {
  name: string;
  diagnosisDate: Date;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    statusCode: number;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Request interfaces
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Database query interfaces
export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface DatabaseQueryOptions extends PaginationOptions, SearchOptions {}