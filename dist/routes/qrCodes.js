"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qrCodeService_1 = require("../services/qrCodeService");
const emailService_1 = require("../services/emailService");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const models_2 = require("../models");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const common_1 = require("../types/common");
const router = (0, express_1.Router)();
/**
 * Generate QR code for a prescription
 * POST /api/v1/qr-codes/generate/:prescriptionId
 */
router.post('/qr-codes/generate/:prescriptionId', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.DOCTOR, models_1.UserRole.ADMIN]), (0, validation_1.validateParams)(schemas_1.prescriptionIdParamSchema), async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        if (!prescriptionId) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Prescription ID is required',
                    statusCode: 400,
                },
            });
        }
        // Verify prescription exists and user has access
        const prescription = await models_2.Prescription.findByPk(prescriptionId, {
            include: [
                { association: 'patient', include: [{ association: 'user' }] },
                { association: 'doctor', include: [{ association: 'user' }] },
                { association: 'items' }
            ]
        });
        if (!prescription) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Prescription not found',
                    statusCode: 404,
                },
            });
        }
        // Generate QR code
        const qrResult = await qrCodeService_1.QRCodeService.generateQRCode(prescriptionId);
        res.status(200).json({
            success: true,
            message: 'QR code generated successfully',
            data: {
                qrCodeImage: qrResult.qrCodeImage,
                qrHash: qrResult.qrHash,
                expiresAt: qrResult.expiresAt,
                prescriptionNumber: prescription.prescriptionNumber,
                patientName: prescription.patient?.user?.fullName || '',
                doctorName: prescription.doctor?.user?.fullName || ''
            },
        });
    }
    catch (error) {
        console.error('QR code generation error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message || 'Failed to generate QR code',
                statusCode: 500,
            },
        });
    }
});
// Note: QR code verification is now handled through the pharmacy workflow
// Use POST /pharmacy/scan instead of this standalone verification endpoint
/**
 * Get QR code statistics
 * GET /api/v1/qr-codes/stats/:qrHash
 */
router.get('/qr-codes/stats/:qrHash', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.DOCTOR, models_1.UserRole.ADMIN, models_1.UserRole.PHARMACIST]), async (req, res) => {
    try {
        const { qrHash } = req.params;
        if (!qrHash) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'QR hash is required',
                    statusCode: 400,
                },
            });
        }
        const stats = await qrCodeService_1.QRCodeService.getQRCodeStats(qrHash);
        if (!stats) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'QR code not found',
                    statusCode: 404,
                },
            });
        }
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('QR code stats error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message || 'Failed to get QR code statistics',
                statusCode: 500,
            },
        });
    }
});
/**
 * Send prescription email with QR code
 * POST /api/v1/qr-codes/email/:prescriptionId
 */
router.post('/qr-codes/email/:prescriptionId', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.DOCTOR, models_1.UserRole.ADMIN]), (0, validation_1.validateParams)(schemas_1.prescriptionIdParamSchema), async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        if (!prescriptionId) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Prescription ID is required',
                    statusCode: 400,
                },
            });
        }
        // Get prescription with related data including existing QR code
        const prescription = await models_2.Prescription.findByPk(prescriptionId, {
            include: [
                { association: 'patient', include: [{ association: 'user' }] },
                { association: 'doctor', include: [{ association: 'user' }] },
                { association: 'items' },
                { association: 'qrCode' }
            ]
        });
        if (!prescription) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Prescription not found',
                    statusCode: 404,
                },
            });
        }
        // Check if QR code already exists and is still valid
        let qrResult;
        if (prescription.qrCode && !prescription.qrCode.isExpired()) {
            // Use existing QR code
            console.log('📧 Using existing QR code for email:', prescription.qrCode.qrHash);
            qrResult = {
                qrCodeImage: await qrCodeService_1.QRCodeService.generateQRCodeImage(prescription.qrCode.qrHash),
                qrHash: prescription.qrCode.qrHash,
                encryptedData: prescription.qrCode.encryptedData,
                expiresAt: prescription.qrCode.expiresAt
            };
        }
        else {
            // Generate new QR code
            console.log('📧 Generating new QR code for email');
            qrResult = await qrCodeService_1.QRCodeService.generateQRCode(prescriptionId);
        }
        // Prepare email data
        const emailData = {
            patientName: prescription.patient?.user?.fullName || '',
            patientEmail: prescription.patient?.user?.email || '',
            prescriptionNumber: prescription.prescriptionNumber || '',
            doctorName: prescription.doctor?.user?.fullName || '',
            diagnosis: prescription.diagnosis,
            medicines: (prescription.items || []).map((item) => ({
                name: item.medicineName,
                dosage: item.dosage,
                frequency: item.frequency,
                quantity: item.quantity,
                instructions: item.instructions
            })),
            qrCodeImage: qrResult.qrCodeImage,
            qrHash: qrResult.qrHash,
            expiresAt: qrResult.expiresAt.toISOString()
        };
        // Send email
        await emailService_1.EmailService.sendPrescriptionEmail(emailData);
        res.status(200).json({
            success: true,
            message: 'Prescription email sent successfully',
            data: {
                patientEmail: emailData.patientEmail,
                prescriptionNumber: emailData.prescriptionNumber,
                qrHash: emailData.qrHash,
                expiresAt: emailData.expiresAt
            },
        });
    }
    catch (error) {
        console.error('Prescription email error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message || 'Failed to send prescription email',
                statusCode: 500,
            },
        });
    }
});
/**
 * Get QR code for a prescription (if exists)
 * GET /api/v1/qr-codes/:prescriptionId
 */
router.get('/qr-codes/:prescriptionId', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.DOCTOR, models_1.UserRole.ADMIN, models_1.UserRole.PATIENT]), (0, validation_1.validateParams)(schemas_1.prescriptionIdParamSchema), async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        if (!prescriptionId) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Prescription ID is required',
                    statusCode: 400,
                },
            });
        }
        // Get prescription with related data
        const prescription = await models_2.Prescription.findByPk(prescriptionId, {
            include: [
                { association: 'patient', include: [{ association: 'user' }] },
                { association: 'doctor', include: [{ association: 'user' }] },
                { association: 'items' },
                { association: 'qrCode' }
            ]
        });
        if (!prescription) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Prescription not found',
                    statusCode: 404,
                },
            });
        }
        // Check if QR code exists
        if (!prescription.qrCode) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'QR code not found for this prescription',
                    statusCode: 404,
                },
            });
        }
        // Check if QR code is expired
        if (prescription.qrCode.isExpired()) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'QR code has expired',
                    statusCode: 400,
                },
            });
        }
        // Generate QR code image
        const qrResult = await qrCodeService_1.QRCodeService.generateQRCode(prescriptionId);
        res.status(200).json({
            success: true,
            data: {
                qrCodeImage: qrResult.qrCodeImage,
                qrHash: qrResult.qrHash,
                expiresAt: qrResult.expiresAt,
                scanCount: prescription.qrCode?.scanCount || 0,
                isUsed: prescription.qrCode?.isUsed || false,
                prescriptionNumber: prescription.prescriptionNumber,
                patientName: prescription.patient?.user?.fullName || '',
                doctorName: prescription.doctor?.user?.fullName || ''
            },
        });
    }
    catch (error) {
        console.error('Get QR code error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message || 'Failed to get QR code',
                statusCode: 500,
            },
        });
    }
});
/**
 * Get all QR codes with pagination (admin only)
 * GET /api/v1/qr-codes
 */
router.get('/qr-codes', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.ADMIN]), (0, validation_1.validateQuery)(schemas_1.advancedPaginationSchema), async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const result = await qrCodeService_1.QRCodeService.getAllQRCodes(pageNum, limitNum, sortBy, sortOrder);
        res.status(200).json({
            success: true,
            data: result.qrCodes,
            pagination: (0, common_1.createPaginationResponse)(pageNum, limitNum, result.total),
        });
    }
    catch (error) {
        console.error('Get QR codes error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message || 'Failed to fetch QR codes',
                statusCode: 500,
            },
        });
    }
});
exports.default = router;
