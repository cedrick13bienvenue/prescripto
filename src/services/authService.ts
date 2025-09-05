import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import { LoginCredentials, RegisterData, AuthResponse, UserProfile, ChangePasswordData, JwtPayload } from '../types';

export class AuthService {
  // User registration
  static async register (data: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password before creating user
      const tempUser = new User();
      const hashedPassword = await tempUser.hashPassword(data.password);

      // Create new user with hashed password
      const user = await User.create({
        email: data.email,
        passwordHash: hashedPassword,
        fullName: data.fullName,
        role: data.role,
        phone: data.phone,
        isActive: true,
      });

      // If registering as a doctor, create doctor profile
      if (data.role === UserRole.DOCTOR) {
        await Doctor.create({
          userId: user.id,
          isVerified: false, // Not verified initially
        });
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
        },
        token,
      };
    } catch (error: any) {
      console.error('Error in register:', error);
      
      // Handle specific Sequelize errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        if (error.errors && error.errors[0] && error.errors[0].path === 'email') {
          throw new Error('Email already exists. Please use a different email address.');
        }
        throw new Error('A record with this information already exists.');
      }
      
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map((err: any) => err.message).join(', ');
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      
      throw error; // Re-throw the original error if it's not a Sequelize error
    }
  }

  // User login
  static async login (credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user by email
    const user = await User.findOne({ where: { email: credentials.email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(credentials.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
      },
      token,
    };
  }

  // Generate JWT token
  private static generateToken (user: User): string {
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const expiresIn = process.env['JWT_EXPIRES_IN'] || '24h';

    return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
  }

  // Get user profile
  static async getProfile (userId: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }


  // Change password
  static async changePassword (userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password and update
    const hashedPassword = await user.hashPassword(newPassword);
    await user.update({ passwordHash: hashedPassword });

    return { message: 'Password updated successfully' };
  }

  // Deactivate user (admin only)
  static async deactivateUser (userId: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ isActive: false });
    return { message: 'User deactivated successfully' };
  }

  // Reactivate user (admin only)
  static async reactivateUser (userId: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ isActive: true });
    return { message: 'User reactivated successfully' };
  }
}
