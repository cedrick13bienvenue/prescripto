import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import {
  authenticateToken,
  requireAdmin,
  requireRole,
} from '../middleware/auth';
import { UserRole } from '../models';
import { validateBody, validateParams } from '../middleware/validation';
import { userLoginSchema, passwordChangeSchema, userIdParamSchema } from '../validation/schemas';

const router = Router();

// Public routes - login only
router.post('/auth/login', validateBody(userLoginSchema), AuthController.login);

// Protected routes
router.get('/auth/profile', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN]), AuthController.getProfile);
router.put('/auth/change-password', authenticateToken, requireRole([UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT, UserRole.PHARMACIST]), validateBody(passwordChangeSchema), AuthController.changePassword);
router.post('/auth/logout', authenticateToken, AuthController.logout);

// Admin only routes
router.put('/auth/users/:userId/deactivate', authenticateToken, requireAdmin, validateParams(userIdParamSchema), AuthController.deactivateUser);
router.put('/auth/users/:userId/reactivate', authenticateToken, requireAdmin, validateParams(userIdParamSchema), AuthController.reactivateUser);

export default router;
