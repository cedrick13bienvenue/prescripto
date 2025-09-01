import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { PatientController } from '../controllers/patientController';
import {
  authenticateToken,
  requireAdmin,
  requireRole,
} from '../middleware/auth';
import { UserRole } from '../models';

const router = Router();

// =============================================================================
// PUBLIC ROUTES (no authentication required)
// =============================================================================

// Auth routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// =============================================================================
// PROTECTED ROUTES (authentication required)
// =============================================================================

// Auth protected routes
router.get('/auth/profile', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), AuthController.getProfile);
router.put('/auth/profile', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), AuthController.updateProfile);
router.put('/auth/change-password', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT, UserRole.PHARMACIST]), AuthController.changePassword);

// Admin only auth routes
router.put('/auth/users/:userId/deactivate', authenticateToken, requireAdmin, AuthController.deactivateUser);
router.put('/auth/users/:userId/reactivate', authenticateToken, requireAdmin, AuthController.reactivateUser);

// Patient management routes (authentication required)
router.post('/patients/register', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]), PatientController.registerPatient);
router.get('/patients/search', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]), PatientController.searchPatients);
router.get('/patients/:patientId', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]), PatientController.getPatientById);
router.put('/patients/:patientId', authenticateToken, requireRole([UserRole.ADMIN, UserRole.DOCTOR]), PatientController.updatePatient);
router.get('/patients/:patientId/history', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT]), PatientController.getPatientMedicalHistory);

// Doctor and Admin only patient routes
router.post('/patients/:patientId/visits', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.createMedicalVisit);
router.post('/patients/:patientId/prescriptions', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.createPrescription);
router.get('/patients/:patientId/prescriptions', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.getPatientPrescriptions);

// Cross-hospital lookup (any authenticated user)
router.get('/patients/reference/:referenceNumber', authenticateToken, PatientController.getPatientByReference);

export default router;
