"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationOptions = exports.customMessages = exports.otpVerificationSchema = exports.emailTestSchema = exports.referenceNumberParamSchema = exports.pharmacistIdParamSchema = exports.prescriptionIdParamSchema = exports.doctorIdParamSchema = exports.patientIdParamSchema = exports.userIdParamSchema = exports.medicalHistoryPaginationSchema = exports.advancedPaginationSchema = exports.paginationSchema = exports.searchQuerySchema = exports.qrCodeVerificationSchema = exports.prescriptionUpdateSchema = exports.prescriptionSchema = exports.prescriptionItemSchema = exports.medicalVisitSchema = exports.doctorUpdateSchema = exports.doctorRegistrationSchema = exports.patientUpdateSchema = exports.patientRegistrationSchema = exports.passwordChangeSchema = exports.userLoginSchema = exports.userRegistrationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const models_1 = require("../models");
// Common validation patterns
const emailPattern = joi_1.default.string().email().required();
const passwordPattern = joi_1.default.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required();
const uuidPattern = joi_1.default.string().uuid().required();
const phonePattern = joi_1.default.string().pattern(/^\+?[\d\s-()]+$/).optional();
const datePattern = joi_1.default.date().max('now').required();
// User Registration Schema
exports.userRegistrationSchema = joi_1.default.object({
    email: emailPattern,
    password: passwordPattern,
    fullName: joi_1.default.string().min(2).max(100).trim().required(),
    role: joi_1.default.string().valid(...Object.values(models_1.UserRole)).required(),
    phone: phonePattern
});
// User Login Schema
exports.userLoginSchema = joi_1.default.object({
    email: emailPattern,
    password: joi_1.default.string().required()
});
// Password Change Schema
exports.passwordChangeSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().required(),
    newPassword: passwordPattern
});
// Patient Registration Schema
exports.patientRegistrationSchema = joi_1.default.object({
    email: emailPattern,
    password: passwordPattern,
    fullName: joi_1.default.string().min(2).max(100).trim().required(),
    dateOfBirth: datePattern,
    gender: joi_1.default.string().valid('male', 'female', 'other').required(),
    insuranceProvider: joi_1.default.string().max(100).trim().optional(),
    insuranceNumber: joi_1.default.string().max(50).trim().optional(),
    allergies: joi_1.default.array().items(joi_1.default.string().max(100).trim()).default([]),
    existingConditions: joi_1.default.array().items(joi_1.default.string().max(100).trim()).default([]),
    emergencyContact: joi_1.default.string().min(2).max(100).trim().required(),
    emergencyPhone: phonePattern.required(),
    phone: phonePattern
});
// Patient Update Schema
exports.patientUpdateSchema = joi_1.default.object({
    fullName: joi_1.default.string().min(2).max(100).trim().optional(),
    dateOfBirth: datePattern.optional(),
    gender: joi_1.default.string().valid('male', 'female', 'other').optional(),
    insuranceProvider: joi_1.default.string().max(100).trim().optional(),
    insuranceNumber: joi_1.default.string().max(50).trim().optional(),
    allergies: joi_1.default.array().items(joi_1.default.string().max(100).trim()).optional(),
    existingConditions: joi_1.default.array().items(joi_1.default.string().max(100).trim()).optional(),
    emergencyContact: joi_1.default.string().min(2).max(100).trim().optional(),
    emergencyPhone: phonePattern.optional(),
    phone: phonePattern.optional()
});
// Doctor Registration Schema
exports.doctorRegistrationSchema = joi_1.default.object({
    email: emailPattern,
    password: passwordPattern,
    fullName: joi_1.default.string().min(2).max(100).trim().required(),
    licenseNumber: joi_1.default.string().max(50).trim().optional(),
    specialization: joi_1.default.string().max(100).trim().optional(),
    hospitalName: joi_1.default.string().max(100).trim().optional(),
    phone: phonePattern
});
// Doctor Update Schema
exports.doctorUpdateSchema = joi_1.default.object({
    licenseNumber: joi_1.default.string().max(50).trim().optional(),
    specialization: joi_1.default.string().max(100).trim().optional(),
    hospitalName: joi_1.default.string().max(100).trim().optional(),
    isVerified: joi_1.default.boolean().optional()
});
// Medical Visit Schema
exports.medicalVisitSchema = joi_1.default.object({
    patientId: uuidPattern,
    doctorId: uuidPattern,
    visitDate: datePattern,
    visitType: joi_1.default.string().valid('consultation', 'emergency', 'followup').required(),
    chiefComplaint: joi_1.default.string().min(5).max(500).trim().required(),
    diagnosis: joi_1.default.string().max(500).trim().optional(),
    doctorNotes: joi_1.default.string().max(1000).trim().optional(),
    vitalSigns: joi_1.default.object({
        bloodPressure: joi_1.default.string().pattern(/^\d{2,3}\/\d{2,3}$/).optional(),
        heartRate: joi_1.default.number().min(30).max(200).optional(),
        temperature: joi_1.default.number().min(95).max(110).optional(),
        weight: joi_1.default.number().min(1).max(1000).optional(),
        height: joi_1.default.number().min(1).max(300).optional()
    }).optional()
});
// Prescription Item Schema
exports.prescriptionItemSchema = joi_1.default.object({
    medicineName: joi_1.default.string().min(2).max(100).trim().required(),
    dosage: joi_1.default.string().min(1).max(50).trim().required(),
    frequency: joi_1.default.string().min(1).max(50).trim().required(),
    quantity: joi_1.default.number().min(1).max(1000).required(),
    instructions: joi_1.default.string().max(200).trim().optional()
});
// Prescription Schema
exports.prescriptionSchema = joi_1.default.object({
    patientId: uuidPattern,
    doctorId: uuidPattern,
    visitId: uuidPattern,
    diagnosis: joi_1.default.string().min(5).max(500).trim().required(),
    doctorNotes: joi_1.default.string().max(1000).trim().optional(),
    items: joi_1.default.array().items(exports.prescriptionItemSchema).min(1).max(10).required()
});
// Prescription Update Schema
exports.prescriptionUpdateSchema = joi_1.default.object({
    diagnosis: joi_1.default.string().min(5).max(500).trim().optional(),
    doctorNotes: joi_1.default.string().max(1000).trim().optional(),
    status: joi_1.default.string().valid('pending', 'fulfilled', 'cancelled').optional(),
    items: joi_1.default.array().items(exports.prescriptionItemSchema).min(1).max(10).optional()
});
// QR Code Verification Schema
exports.qrCodeVerificationSchema = joi_1.default.object({
    qrHash: joi_1.default.string().length(32).pattern(/^[a-f0-9]+$/).required()
});
// Search Query Schema
exports.searchQuerySchema = joi_1.default.object({
    query: joi_1.default.string().min(2).max(100).trim().required(),
    page: joi_1.default.number().min(1).default(1),
    limit: joi_1.default.number().min(1).max(100).default(10)
});
// Pagination Schema
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().min(1).default(1),
    limit: joi_1.default.number().min(1).max(100).default(10)
});
// Advanced Pagination Schema (with sorting)
exports.advancedPaginationSchema = joi_1.default.object({
    page: joi_1.default.number().min(1).default(1),
    limit: joi_1.default.number().min(1).max(100).default(10),
    sortBy: joi_1.default.string().valid('createdAt', 'updatedAt', 'fullName', 'email', 'visitDate', 'prescriptionNumber').default('createdAt'),
    sortOrder: joi_1.default.string().valid('ASC', 'DESC').default('DESC')
});
// Medical History Pagination Schema
exports.medicalHistoryPaginationSchema = joi_1.default.object({
    page: joi_1.default.number().min(1).default(1),
    limit: joi_1.default.number().min(1).max(50).default(10),
    type: joi_1.default.string().valid('visits', 'prescriptions', 'all').default('all'),
    sortBy: joi_1.default.string().valid('createdAt', 'visitDate', 'prescriptionNumber').default('createdAt'),
    sortOrder: joi_1.default.string().valid('ASC', 'DESC').default('DESC'),
    otpCode: joi_1.default.string().length(6).pattern(/^\d{6}$/).optional()
});
// User ID Parameter Schema
exports.userIdParamSchema = joi_1.default.object({
    userId: uuidPattern
});
// Patient ID Parameter Schema
exports.patientIdParamSchema = joi_1.default.object({
    patientId: uuidPattern
});
// Doctor ID Parameter Schema
exports.doctorIdParamSchema = joi_1.default.object({
    doctorId: uuidPattern
});
// Prescription ID Parameter Schema
exports.prescriptionIdParamSchema = joi_1.default.object({
    prescriptionId: uuidPattern
});
// Pharmacist ID Parameter Schema
exports.pharmacistIdParamSchema = joi_1.default.object({
    pharmacistId: uuidPattern
});
// Reference Number Parameter Schema
exports.referenceNumberParamSchema = joi_1.default.object({
    referenceNumber: joi_1.default.string().pattern(/^PAT-\d{8}-\d{4}$/).required()
});
// Email Test Schema
exports.emailTestSchema = joi_1.default.object({
    email: emailPattern,
    name: joi_1.default.string().min(2).max(100).trim().required()
});
// OTP Verification Schema
exports.otpVerificationSchema = joi_1.default.object({
    otpCode: joi_1.default.string().length(6).pattern(/^\d{6}$/).required()
});
// Custom validation messages
exports.customMessages = {
    'string.email': 'Please provide a valid email address',
    'string.min': 'This field must be at least {#limit} characters long',
    'string.max': 'This field must not exceed {#limit} characters',
    'string.pattern.base': 'Please provide a valid format for this field',
    'number.min': 'This value must be at least {#limit}',
    'number.max': 'This value must not exceed {#limit}',
    'any.required': 'This field is required',
    'any.only': 'This field must be one of: {#valids}',
    'array.min': 'At least {#limit} item(s) required',
    'array.max': 'Maximum {#limit} item(s) allowed',
    'date.max': 'Date cannot be in the future'
};
// Validation options
exports.validationOptions = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
    messages: exports.customMessages
};
