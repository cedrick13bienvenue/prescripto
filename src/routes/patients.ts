import { Router } from 'express';
import { PatientController } from '../controllers/patientController';
import { 
  authenticateToken, 
  requireRole 
} from '../middleware/auth';
import { UserRole } from '../models';

const router = Router();

// Public routes (no authentication required)
router.post('/register', PatientController.registerPatient);

// Protected routes (authentication required)
router.get('/search', authenticateToken, PatientController.searchPatients);
router.get('/:patientId', authenticateToken, PatientController.getPatientById);
router.put('/:patientId', authenticateToken, PatientController.updatePatient);

// Doctor and Admin only routes
router.get('/:patientId/history', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.getPatientMedicalHistory);
router.post('/:patientId/visits', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.createMedicalVisit);
router.post('/:patientId/prescriptions', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.createPrescription);
router.get('/:patientId/prescriptions', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), PatientController.getPatientPrescriptions);

// Cross-hospital lookup (any authenticated user)
router.get('/reference/:referenceNumber', authenticateToken, PatientController.getPatientByReference);

export default router;
