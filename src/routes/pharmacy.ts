import { Router } from 'express';
import { PharmacyController } from '../controllers/pharmacyController';
import { authenticateToken, requirePharmacist } from '../middleware/auth';
import { validateParams } from '../middleware/validation';
import { prescriptionIdParamSchema } from '../validation/schemas';

const router = Router();

// Pharmacist only routes for pharmacy operations
router.post('/pharmacy/scan', authenticateToken, requirePharmacist, PharmacyController.scanQRCode);
router.post('/pharmacy/lookup', authenticateToken, requirePharmacist, PharmacyController.lookupByReferenceNumber);
router.post('/pharmacy/validate/:prescriptionId', authenticateToken, requirePharmacist, validateParams(prescriptionIdParamSchema), PharmacyController.validatePrescription);
router.post('/pharmacy/dispense/:prescriptionId', authenticateToken, requirePharmacist, validateParams(prescriptionIdParamSchema), PharmacyController.dispensePrescription);
router.post('/pharmacy/reject/:prescriptionId', authenticateToken, requirePharmacist, validateParams(prescriptionIdParamSchema), PharmacyController.rejectPrescription);
router.get('/pharmacy/logs/:prescriptionId', authenticateToken, requirePharmacist, validateParams(prescriptionIdParamSchema), PharmacyController.getPrescriptionLogs);
router.get('/pharmacy/history', authenticateToken, requirePharmacist, PharmacyController.getPharmacistHistory);
router.get('/pharmacy/scan-status/:qrHash', authenticateToken, requirePharmacist, PharmacyController.checkScanStatus);

// Enhanced dispensing routes
router.get('/pharmacy/dispensing-history/:prescriptionId', authenticateToken, requirePharmacist, validateParams(prescriptionIdParamSchema), PharmacyController.getDispensingHistory);
router.get('/pharmacy/dispensing-summary/:prescriptionId', authenticateToken, requirePharmacist, validateParams(prescriptionIdParamSchema), PharmacyController.getDispensingSummary);

export default router;
