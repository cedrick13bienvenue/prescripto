export declare enum UserRole {
    PATIENT = "patient",
    DOCTOR = "doctor",
    PHARMACIST = "pharmacist",
    ADMIN = "admin"
}
export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare enum PrescriptionStatus {
    PENDING = "pending",
    FULFILLED = "fulfilled",
    CANCELLED = "cancelled",
    EXPIRED = "expired"
}
export declare enum VisitType {
    CONSULTATION = "consultation",
    EMERGENCY = "emergency",
    FOLLOWUP = "followup"
}
export declare enum TestType {
    BLOOD = "blood",
    URINE = "urine",
    XRAY = "xray",
    MRI = "mri"
}
export declare enum PharmacyAction {
    SCANNED = "scanned",
    VALIDATED = "validated",
    FULFILLED = "fulfilled",
    REJECTED = "rejected"
}
export declare enum EmailType {
    PRESCRIPTION_QR = "prescription_qr",
    MEDICAL_REPORT = "medical_report",
    NOTIFICATION = "notification"
}
export interface BaseModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface User extends BaseModel {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    phone?: string;
    isActive: boolean;
}
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
export interface Doctor extends BaseModel {
    userId: string;
    licenseNumber: string;
    specialization: string;
    hospitalName: string;
    hospitalId: string;
    isVerified: boolean;
}
export interface Pharmacist extends BaseModel {
    userId: string;
    licenseNumber: string;
    pharmacyName: string;
    pharmacyLicense: string;
    isVerified: boolean;
}
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
export interface QRCode extends BaseModel {
    qrHash: string;
    prescriptionId: string;
    encryptedData: string;
    expiresAt: Date;
    isUsed: boolean;
    scanCount: number;
    lastScanned?: Date;
}
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
export interface AuditLog extends BaseModel {
    userId: string;
    action: string;
    tableName: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
}
export interface SystemSetting extends BaseModel {
    settingKey: string;
    settingValue: string;
    description: string;
    updatedBy: string;
}
export interface Allergy {
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    reaction?: string;
    notes?: string;
}
export interface MedicalCondition {
    name: string;
    diagnosisDate: Date;
    status: 'active' | 'resolved' | 'chronic';
    notes?: string;
}
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
export interface AuthenticatedRequest extends Request {
    user?: User;
}
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
export interface DatabaseQueryOptions extends PaginationOptions, SearchOptions {
}
//# sourceMappingURL=index.d.ts.map