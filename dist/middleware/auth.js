"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStaff = exports.requireAdmin = exports.requirePharmacist = exports.requireDoctor = exports.requirePatient = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
// JWT verification middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        res.status(401).json({
            success: false,
            error: {
                message: 'Access token required',
                statusCode: 401,
            },
        });
        return;
    }
    try {
        // Check if token is blacklisted
        try {
            const isBlacklisted = await models_1.TokenBlacklist.isTokenBlacklisted(token);
            if (isBlacklisted) {
                res.status(403).json({
                    success: false,
                    error: {
                        message: 'Token has been revoked',
                        statusCode: 403,
                    },
                });
                return;
            }
        }
        catch (blacklistError) {
            // If blacklist check fails, log error but continue with normal JWT validation
            console.warn('Token blacklist check failed:', blacklistError);
        }
        const secret = process.env['JWT_SECRET'];
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            fullName: decoded.fullName,
        };
        next();
    }
    catch (error) {
        res.status(403).json({
            success: false,
            error: {
                message: 'Invalid or expired token',
                statusCode: 403,
            },
        });
    }
};
exports.authenticateToken = authenticateToken;
// Role-based access control middleware
const requireRole = (allowedRoles) => (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: {
                message: 'Authentication required',
                statusCode: 401,
            },
        });
        return;
    }
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
        res.status(403).json({
            success: false,
            error: {
                message: 'Insufficient permissions',
                statusCode: 403,
            },
        });
        return;
    }
    next();
};
exports.requireRole = requireRole;
// Specific role middlewares
exports.requirePatient = (0, exports.requireRole)(models_1.UserRole.PATIENT);
exports.requireDoctor = (0, exports.requireRole)(models_1.UserRole.DOCTOR);
exports.requirePharmacist = (0, exports.requireRole)(models_1.UserRole.PHARMACIST);
exports.requireAdmin = (0, exports.requireRole)(models_1.UserRole.ADMIN);
exports.requireStaff = (0, exports.requireRole)([models_1.UserRole.DOCTOR, models_1.UserRole.PHARMACIST, models_1.UserRole.ADMIN]);
