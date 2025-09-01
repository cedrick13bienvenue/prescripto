import { Router } from 'express';
import { PatientController } from '../controllers/patientController';
import {
  authenticateToken,
  requireRole,
} from '../middleware/auth';
import { User, UserRole } from '../models';

const router = Router();

// Protected routes (authentication required)
router.post('/register', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]), PatientController.registerPatient);
router.get('/search', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]), PatientController.searchPatients);
router.get('/:patientId', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]), PatientController.getPatientById);
router.put('/:patientId', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]),PatientController.updatePatient);
router.get('/:patientId/history', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT]), PatientController.getPatientMedicalHistory);

// Doctor and Admin only routes
router.post('/:patientId/visits', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.createMedicalVisit);
router.post('/:patientId/prescriptions', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.createPrescription);
router.get('/:patientId/prescriptions', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.getPatientPrescriptions);

// Cross-hospital lookup (any authenticated user)
router.get('/reference/:referenceNumber', authenticateToken, PatientController.getPatientByReference);

export default router;

