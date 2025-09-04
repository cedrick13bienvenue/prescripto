import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '../models';
import { LoginCredentials, ChangePasswordData } from '../types';

export class AuthController {


  // User login
  static async login (req: Request, res: Response) {
    try {
      const credentials: LoginCredentials = req.body;

      // Basic validation
      if (!credentials.email || !credentials.password) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Email and password are required',
            statusCode: 400,
          },
        });
      }

      const result = await AuthService.login(credentials);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 401,
        },
      });
    }
  }

  // Get user profile
  static async getProfile (req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            statusCode: 401,
          },
        });
      }

      const profile = await AuthService.getProfile(req.user.id);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 404,
        },
      });
    }
  }


  // Change password
  static async changePassword (req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            statusCode: 401,
          },
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Current password and new password are required',
            statusCode: 400,
          },
        });
      }

      // Password strength validation
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'New password must be at least 6 characters long',
            statusCode: 400,
          },
        });
      }

      const result = await AuthService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 400,
        },
      });
    }
  }

  // Admin: Deactivate user
  static async deactivateUser (req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            statusCode: 401,
          },
        });
      }

      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'User ID is required',
            statusCode: 400,
          },
        });
      }

      const result = await AuthService.deactivateUser(userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 400,
        },
      });
    }
  }

  // Admin: Reactivate user
  static async reactivateUser (req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            statusCode: 401,
          },
        });
      }

      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'User ID is required',
            statusCode: 400,
          },
        });
      }

      const result = await AuthService.reactivateUser(userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 400,
        },
      });
    }
  }
}
