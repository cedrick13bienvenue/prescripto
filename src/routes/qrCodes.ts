import { Router } from 'express';
import { Request, Response } from 'express';
import { QRCodeService } from '../services/qrCodeService';
import { EmailService } from '../services/emailService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models';
import { Prescription } from '../models';
import { validateParams } from '../middleware/validation';
import { prescriptionIdParamSchema, qrHashParamSchema } from '../validation/schemas';

const router = Router();

/**
 * Generate QR code for a prescription
 * POST /api/v1/qr-codes/generate/:prescriptionId
 */
router.post('/qr-codes/generate/:prescriptionId', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), validateParams(prescriptionIdParamSchema), async (req: Request, res: Response) => {
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
    const prescription = await Prescription.findByPk(prescriptionId, {
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
    const qrResult = await QRCodeService.generateQRCode(prescriptionId);

    res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCodeImage: qrResult.qrCodeImage,
        qrHash: qrResult.qrHash,
        expiresAt: qrResult.expiresAt,
        prescriptionNumber: prescription.prescriptionNumber,
        patientName: (prescription as any).patient?.user?.fullName || '',
        doctorName: (prescription as any).doctor?.user?.fullName || ''
      },
    });
  } catch (error: any) {
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

/**
 * Verify QR code
 * GET /api/v1/qr-codes/verify/:qrHash
 */
router.get('/qr-codes/verify/:qrHash', authenticateToken, validateParams(qrHashParamSchema), async (req: Request, res: Response) => {
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

    // Verify QR code
    const verificationResult = await QRCodeService.verifyQRCode(qrHash);

    if (!verificationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: verificationResult.error || 'Invalid QR code',
          statusCode: 400,
        },
        data: {
          isValid: verificationResult.isValid,
          isExpired: verificationResult.isExpired,
          isUsed: verificationResult.isUsed,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'QR code verified successfully',
      data: {
        isValid: verificationResult.isValid,
        isExpired: verificationResult.isExpired,
        isUsed: verificationResult.isUsed,
        prescriptionData: verificationResult.prescriptionData,
      },
    });
  } catch (error: any) {
    console.error('QR code verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to verify QR code',
        statusCode: 500,
      },
    });
  }
});

/**
 * Get QR code statistics
 * GET /api/v1/qr-codes/stats/:qrHash
 */
router.get('/qr-codes/stats/:qrHash', authenticateToken, validateParams(qrHashParamSchema), async (req: Request, res: Response) => {
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

    const stats = await QRCodeService.getQRCodeStats(qrHash);

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
  } catch (error: any) {
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
router.post('/qr-codes/email/:prescriptionId', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), validateParams(prescriptionIdParamSchema), async (req: Request, res: Response) => {
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
    const prescription = await Prescription.findByPk(prescriptionId, {
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
    const qrResult = await QRCodeService.generateQRCode(prescriptionId);

    // Prepare email data
    const emailData = {
      patientName: (prescription as any).patient?.user?.fullName || '',
      patientEmail: (prescription as any).patient?.user?.email || '',
      prescriptionNumber: prescription.prescriptionNumber || '',
      doctorName: (prescription as any).doctor?.user?.fullName || '',
      diagnosis: prescription.diagnosis,
      medicines: ((prescription as any).items || []).map((item: any) => ({
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
    await EmailService.sendPrescriptionEmail(emailData);

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
  } catch (error: any) {
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
router.get('/qr-codes/:prescriptionId', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT]), validateParams(prescriptionIdParamSchema), async (req: Request, res: Response) => {
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
    const prescription = await Prescription.findByPk(prescriptionId, {
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
    if (!(prescription as any).qrCode) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'QR code not found for this prescription',
          statusCode: 404,
        },
      });
    }

    // Check if QR code is expired
    if ((prescription as any).qrCode.isExpired()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'QR code has expired',
          statusCode: 400,
        },
      });
    }

    // Generate QR code image
    const qrResult = await QRCodeService.generateQRCode(prescriptionId);

    res.status(200).json({
      success: true,
      data: {
        qrCodeImage: qrResult.qrCodeImage,
        qrHash: qrResult.qrHash,
        expiresAt: qrResult.expiresAt,
        scanCount: (prescription as any).qrCode?.scanCount || 0,
        isUsed: (prescription as any).qrCode?.isUsed || false,
        prescriptionNumber: prescription.prescriptionNumber,
        patientName: (prescription as any).patient?.user?.fullName || '',
        doctorName: (prescription as any).doctor?.user?.fullName || ''
      },
    });
  } catch (error: any) {
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

export default router;
