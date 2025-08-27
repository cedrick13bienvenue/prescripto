import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    phone?: string;
  };
  token: string;
}

export class AuthService {
  // User registration
  static async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = await User.create({
      email: data.email,
      password: data.password, // Will be hashed by model hooks
      fullName: data.fullName,
      role: data.role,
      phone: data.phone,
      isActive: true
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone
      },
      token
    };
  }

  // User login
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
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
        phone: user.phone
      },
      token
    };
  }

  // Generate JWT token
  private static generateToken(user: User): string {
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };

    const expiresIn = process.env['JWT_EXPIRES_IN'] || '24h';
    
    return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
  }

  // Get user profile
  static async getProfile(userId: string) {
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
      createdAt: user.createdAt
    };
  }

  // Update user profile
  static async updateProfile(userId: string, updateData: Partial<{ fullName: string; phone: string }>) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update(updateData);
    
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      updatedAt: user.updatedAt
    };
  }

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password (will be hashed by model hooks)
    await user.update({ password: newPassword } as any);

    return { message: 'Password updated successfully' };
  }

  // Deactivate user (admin only)
  static async deactivateUser(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ isActive: false });
    return { message: 'User deactivated successfully' };
  }

  // Reactivate user (admin only)
  static async reactivateUser(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ isActive: true });
    return { message: 'User reactivated successfully' };
  }
}
