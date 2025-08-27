import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { 
  authenticateToken, 
  requireAdmin, 
  requireRole 
} from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.put('/change-password', authenticateToken, AuthController.changePassword);

// Admin only routes
router.put('/users/:userId/deactivate', authenticateToken, requireAdmin, AuthController.deactivateUser);
router.put('/users/:userId/reactivate', authenticateToken, requireAdmin, AuthController.reactivateUser);

export default router;
