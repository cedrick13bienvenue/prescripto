import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import {
  authenticateToken,
  requireAdmin,
  requireRole,
} from '../middleware/auth';
import { UserRole } from '../models';

const router = Router();

// Public routes (no authentication required)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), AuthController.getProfile);
router.put('/profile', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), AuthController.updateProfile);
router.put('/change-password', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT, UserRole.PHARMACIST]), AuthController.changePassword);

// Admin only routes
router.put('/users/:userId/deactivate', authenticateToken, requireAdmin, AuthController.deactivateUser);
router.put('/users/:userId/reactivate', authenticateToken, requireAdmin, AuthController.reactivateUser);

export default router;