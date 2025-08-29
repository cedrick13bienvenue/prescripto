import { Request, Response } from 'express';
import { AuthService, LoginCredentials, RegisterData } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  // User registration
  static async register (req: Request, res: Response) {
    try {
      const data: RegisterData = req.body;

      // Basic validation
      if (!data.email || !data.password || !data.fullName || !data.role) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Email, password, full name, and role are required',
            statusCode: 400,
          },
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid email format',
            statusCode: 400,
          },
        });
      }

      // Password strength validation
      if (data.password.length < 6) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Password must be at least 6 characters long',
            statusCode: 400,
          },
        });
      }

      const result = await AuthService.register(data);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
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

  // Update user profile
  static async updateProfile (req: AuthenticatedRequest, res: Response) {
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

      const updateData = req.body;
      const allowedFields = ['fullName', 'phone'];
      const filteredData: any = {};

      // Only allow specific fields to be updated
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No valid fields to update',
            statusCode: 400,
          },
        });
      }

      const updatedProfile = await AuthService.updateProfile(req.user.id, filteredData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
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
