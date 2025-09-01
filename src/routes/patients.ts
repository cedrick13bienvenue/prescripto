import { Router } from 'express';
import { PatientController } from '../controllers/patientController';
import {
  authenticateToken,
  requireRole,
} from '../middleware/auth';
import { User, UserRole } from '../models';

const router = Router();

// Protected routes (authentication required)
router.post('/patients/register', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]), PatientController.registerPatient);
router.get('/patients/search', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]), PatientController.searchPatients);
router.get('/patients/:patientId', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]), PatientController.getPatientById);
router.put('/patients/:patientId', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]), PatientController.updatePatient);
router.get('/patients/:patientId/history', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT]), PatientController.getPatientMedicalHistory);

// Doctor and Admin only routes
router.post('/patients/:patientId/visits', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.createMedicalVisit);
router.post('/patients/:patientId/prescriptions', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.createPrescription);
router.get('/patients/:patientId/prescriptions', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.getPatientPrescriptions);

// Cross-hospital lookup (any authenticated user)
router.get('/patients/reference/:referenceNumber', authenticateToken, PatientController.getPatientByReference);

export default router;
