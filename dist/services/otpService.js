"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPService = void 0;
const OTPVerification_1 = __importDefault(require("../models/OTPVerification"));
const emailService_1 = require("./emailService");
const models_1 = require("../models");
class OTPService {
    /**
     * Generate and send OTP for medical history access
     */
    static async generateAndSendOTP(patientId) {
        try {
            // Get patient information
            const patient = await models_1.Patient.findByPk(patientId, {
                include: [{ association: 'user' }]
            });
            if (!patient) {
                return {
                    success: false,
                    message: 'Patient not found'
                };
            }
            // Check if there's already a valid OTP for this patient
            const existingOTP = await OTPVerification_1.default.findOne({
                where: {
                    patientId,
                    isUsed: false,
                    purpose: 'medical_history_access'
                }
            });
            if (existingOTP && !existingOTP.isExpired()) {
                return {
                    success: false,
                    message: 'An OTP has already been sent. Please check your email or wait for it to expire.'
                };
            }
            // Generate new OTP
            const otpCode = OTPVerification_1.default.generateOTPCode();
            const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
            // Create OTP record
            const otpRecord = await OTPVerification_1.default.create({
                patientId,
                email: patient.user?.email || patient.email,
                otpCode,
                purpose: 'medical_history_access',
                isUsed: false,
                expiresAt
            });
            // Send OTP email
            const emailData = {
                patientName: patient.fullName,
                patientEmail: patient.user?.email || patient.email,
                otpCode,
                expiresAt
            };
            await this.sendOTPEmail(emailData);
            return {
                success: true,
                otpId: otpRecord.id,
                message: 'OTP sent successfully to your email address',
                expiresAt
            };
        }
        catch (error) {
            console.error('Error generating OTP:', error);
            return {
                success: false,
                message: `Failed to generate OTP: ${error.message}`
            };
        }
    }
    /**
     * Verify OTP code
     */
    static async verifyOTP(otpCode, patientId) {
        try {
            const otp = await OTPVerification_1.default.findValidOTP(otpCode, patientId);
            if (!otp) {
                return {
                    isValid: false,
                    message: 'Invalid or expired OTP code'
                };
            }
            // Mark OTP as used
            otp.isUsed = true;
            await otp.save();
            return {
                isValid: true,
                message: 'OTP verified successfully',
                otpId: otp.id
            };
        }
        catch (error) {
            console.error('Error verifying OTP:', error);
            return {
                isValid: false,
                message: `Failed to verify OTP: ${error.message}`
            };
        }
    }
    /**
     * Send OTP email
     */
    static async sendOTPEmail(data) {
        try {
            return await emailService_1.EmailService.sendOTPEmail(data);
        }
        catch (error) {
            console.error('❌ Failed to send OTP email:', error);
            throw new Error(`Failed to send OTP email: ${error.message}`);
        }
    }
    /**
     * Clean up expired OTPs
     */
    static async cleanupExpiredOTPs() {
        await OTPVerification_1.default.cleanupExpiredOTPs();
    }
}
exports.OTPService = OTPService;
OTPService.OTP_EXPIRY_MINUTES = 10; // OTP expires in 10 minutes
