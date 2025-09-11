"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    // User login
    static async login(req, res) {
        try {
            const credentials = req.body;
            const result = await authService_1.AuthService.login(credentials);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        }
        catch (error) {
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
    static async getProfile(req, res) {
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
            const profile = await authService_1.AuthService.getProfile(req.user.id);
            res.status(200).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
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
    static async changePassword(req, res) {
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
            const result = await authService_1.AuthService.changePassword(req.user.id, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
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
    static async deactivateUser(req, res) {
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
            const result = await authService_1.AuthService.deactivateUser(userId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
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
    static async reactivateUser(req, res) {
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
            const result = await authService_1.AuthService.reactivateUser(userId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    statusCode: 400,
                },
            });
        }
    }
    // User logout
    static async logout(req, res) {
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
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Token is required for logout',
                        statusCode: 400,
                    },
                });
            }
            const result = await authService_1.AuthService.logout(token, req.user.id);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
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
exports.AuthController = AuthController;
