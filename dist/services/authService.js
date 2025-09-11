"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const Doctor_1 = __importDefault(require("../models/Doctor"));
const Patient_1 = __importDefault(require("../models/Patient"));
class AuthService {
    // User registration
    static async register(data) {
        try {
            // Check if user already exists
            const existingUser = await models_1.User.findOne({ where: { email: data.email } });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
            // Hash password before creating user
            const tempUser = new models_1.User();
            const hashedPassword = await tempUser.hashPassword(data.password);
            // Create new user with hashed password
            const user = await models_1.User.create({
                email: data.email,
                passwordHash: hashedPassword,
                fullName: data.fullName,
                role: data.role,
                phone: data.phone,
                isActive: true,
            });
            // If registering as a doctor, create doctor profile
            if (data.role === models_1.UserRole.DOCTOR) {
                await Doctor_1.default.create({
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
        }
        catch (error) {
            console.error('Error in register:', error);
            // Handle specific Sequelize errors
            if (error.name === 'SequelizeUniqueConstraintError') {
                if (error.errors && error.errors[0] && error.errors[0].path === 'email') {
                    throw new Error('Email already exists. Please use a different email address.');
                }
                throw new Error('A record with this information already exists.');
            }
            if (error.name === 'SequelizeValidationError') {
                const validationErrors = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Validation failed: ${validationErrors}`);
            }
            throw error; // Re-throw the original error if it's not a Sequelize error
        }
    }
    // User login
    static async login(credentials) {
        // Find user by email
        const user = await models_1.User.findOne({ where: { email: credentials.email } });
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
        // Fetch patient ID if user is a patient
        let patientId;
        if (user.role === models_1.UserRole.PATIENT) {
            const patient = await Patient_1.default.findOne({ where: { userId: user.id } });
            if (patient) {
                patientId = patient.id;
            }
        }
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                phone: user.phone,
                ...(patientId && { patientId }),
            },
            token,
        };
    }
    // Generate JWT token
    static generateToken(user) {
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
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expiresIn });
    }
    // Get user profile
    static async getProfile(userId) {
        const user = await models_1.User.findByPk(userId);
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
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await models_1.User.findByPk(userId);
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
    static async deactivateUser(userId) {
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await user.update({ isActive: false });
        return { message: 'User deactivated successfully' };
    }
    // Reactivate user (admin only)
    static async reactivateUser(userId) {
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await user.update({ isActive: true });
        return { message: 'User reactivated successfully' };
    }
    // User logout - blacklist token
    static async logout(token, userId) {
        try {
            // Decode token to get expiration time
            const secret = process.env['JWT_SECRET'];
            if (!secret) {
                throw new Error('JWT_SECRET not configured');
            }
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            const expiresAt = new Date(decoded.exp * 1000); // Convert from seconds to milliseconds
            // Add token to blacklist
            await models_1.TokenBlacklist.blacklistToken(token, userId, expiresAt);
            return { message: 'Logout successful' };
        }
        catch (error) {
            // If token is invalid or expired, we still consider logout successful
            // as the token is effectively invalidated
            if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                return { message: 'Logout successful' };
            }
            throw error;
        }
    }
    // Check if token is blacklisted
    static async isTokenBlacklisted(token) {
        try {
            return await models_1.TokenBlacklist.isTokenBlacklisted(token);
        }
        catch (error) {
            console.warn('Error checking token blacklist:', error);
            return false; // If blacklist check fails, assume token is not blacklisted
        }
    }
    // Clean up expired tokens from blacklist
    static async cleanupExpiredTokens() {
        try {
            await models_1.TokenBlacklist.cleanupExpiredTokens();
        }
        catch (error) {
            console.warn('Error cleaning up expired tokens:', error);
        }
    }
}
exports.AuthService = AuthService;
