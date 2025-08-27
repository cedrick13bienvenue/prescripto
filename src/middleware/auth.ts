import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models';

// Extend Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
  };
}

// JWT verification middleware
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Access token required',
        statusCode: 401
      }
    });
    return;
  }

  try {
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName
    };
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        statusCode: 403
      }
    });
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles: UserRole | UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          statusCode: 401
        }
      });
      return;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          statusCode: 403
        }
      });
      return;
    }

    next();
  };
};

// Specific role middlewares
export const requirePatient = requireRole(UserRole.PATIENT);
export const requireDoctor = requireRole(UserRole.DOCTOR);
export const requirePharmacist = requireRole(UserRole.PHARMACIST);
export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireStaff = requireRole([UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.ADMIN]);