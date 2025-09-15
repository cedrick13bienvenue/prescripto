"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTPForPatient = exports.requireOTPVerification = void 0;
const otpService_1 = require("../services/otpService");
const models_1 = require("../models");
/**
 * Middleware to require OTP verification for patient medical history access
 * Only applies to PATIENT role users accessing their own medical history
 */
const requireOTPVerification = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const { otpCode } = req.query;
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'Authentication required',
                    statusCode: 401,
                },
            });
            return;
        }
        // Only require OTP for PATIENT role users accessing their own medical history
        if (req.user.role !== models_1.UserRole.PATIENT) {
            return next();
        }
        // Check if patient is accessing their own record
        // First, get the patient record to check if it belongs to the authenticated user
        const { Patient } = await Promise.resolve().then(() => __importStar(require('../models')));
        const patient = await Patient.findByPk(patientId);
        if (!patient) {
            res.status(404).json({
                success: false,
                error: {
                    message: 'Patient not found',
                    statusCode: 404,
                },
            });
            return;
        }
        if (patient.userId !== req.user.id) {
            res.status(403).json({
                success: false,
                error: {
                    message: 'Access denied: You can only access your own medical history',
                    statusCode: 403,
                },
            });
            return;
        }
        // Check if OTP code is provided and convert to string
        if (!otpCode || typeof otpCode !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    message: 'OTP code is required for medical history access. Please request an OTP first and include it as a query parameter.',
                    statusCode: 400,
                    requiresOTP: true,
                },
            });
            return;
        }
        // Verify OTP
        const verificationResult = await otpService_1.OTPService.verifyOTP(otpCode, patientId);
        if (!verificationResult.isValid) {
            res.status(400).json({
                success: false,
                error: {
                    message: verificationResult.message,
                    statusCode: 400,
                    requiresOTP: true,
                },
            });
            return;
        }
        // OTP is valid, proceed to next middleware
        next();
    }
    catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'OTP verification failed',
                statusCode: 500,
            },
        });
    }
};
exports.requireOTPVerification = requireOTPVerification;
/**
 * Middleware to handle OTP generation request
 * Only applies to PATIENT role users
 */
const generateOTPForPatient = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'Authentication required',
                    statusCode: 401,
                },
            });
            return;
        }
        // Only allow PATIENT role users to generate OTP for their own record
        if (req.user.role !== models_1.UserRole.PATIENT) {
            res.status(403).json({
                success: false,
                error: {
                    message: 'Only patients can request OTP verification',
                    statusCode: 403,
                },
            });
            return;
        }
        // Check if patient is requesting OTP for their own record
        // First, get the patient record to check if it belongs to the authenticated user
        const { Patient } = await Promise.resolve().then(() => __importStar(require('../models')));
        const patient = await Patient.findByPk(patientId);
        if (!patient) {
            res.status(404).json({
                success: false,
                error: {
                    message: 'Patient not found',
                    statusCode: 404,
                },
            });
            return;
        }
        if (patient.userId !== req.user.id) {
            res.status(403).json({
                success: false,
                error: {
                    message: 'Access denied: You can only request OTP for your own medical history',
                    statusCode: 403,
                },
            });
            return;
        }
        // Generate and send OTP
        const otpResult = await otpService_1.OTPService.generateAndSendOTP(patientId);
        if (!otpResult.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: otpResult.message,
                    statusCode: 400,
                },
            });
            return;
        }
        // Return OTP generation success response
        res.status(200).json({
            success: true,
            message: otpResult.message,
            data: {
                expiresAt: otpResult.expiresAt,
                otpId: otpResult.otpId,
            },
        });
    }
    catch (error) {
        console.error('OTP generation error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to generate OTP',
                statusCode: 500,
            },
        });
    }
};
exports.generateOTPForPatient = generateOTPForPatient;
