"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacistController = void 0;
const pharmacistService_1 = require("../services/pharmacistService");
const authService_1 = require("../services/authService");
const models_1 = require("../models");
const common_1 = require("../types/common");
class PharmacistController {
    // Register pharmacist (admin only)
    static async registerPharmacist(req, res) {
        try {
            const data = req.body;
            // Basic validation
            if (!data.email || !data.password || !data.fullName || !data.licenseNumber || !data.pharmacyName) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Email, password, full name, license number, and pharmacy name are required',
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
            // Register user first
            const userData = {
                email: data.email,
                password: data.password,
                fullName: data.fullName,
                role: models_1.UserRole.PHARMACIST,
                phone: data.phone,
            };
            const user = await authService_1.AuthService.register(userData);
            // Create pharmacist profile
            const pharmacist = await pharmacistService_1.PharmacistService.createPharmacistProfile({
                userId: user.user.id,
                licenseNumber: data.licenseNumber,
                pharmacyName: data.pharmacyName,
                pharmacyAddress: data.pharmacyAddress,
            });
            res.status(201).json({
                success: true,
                message: 'Pharmacist registered successfully',
                data: {
                    user: {
                        id: user.user.id,
                        email: user.user.email,
                        fullName: user.user.fullName,
                        role: user.user.role,
                        phone: user.user.phone,
                    },
                    pharmacist: {
                        id: pharmacist.id,
                        licenseNumber: pharmacist.licenseNumber,
                        pharmacyName: pharmacist.pharmacyName,
                        pharmacyAddress: pharmacist.pharmacyAddress,
                        isVerified: pharmacist.isVerified,
                    },
                },
            });
        }
        catch (error) {
            console.error('Pharmacist registration error:', error);
            res.status(400).json({
                success: false,
                error: {
                    message: error.message || 'Pharmacist registration failed',
                    statusCode: 400,
                },
            });
        }
    }
    // Get all pharmacists with pagination (admin only)
    static async getAllPharmacists(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const result = await pharmacistService_1.PharmacistService.getAllPharmacists(pageNum, limitNum);
            res.status(200).json({
                success: true,
                data: result,
                pagination: (0, common_1.createPaginationResponse)(pageNum, limitNum, result.total),
            });
        }
        catch (error) {
            console.error('Error fetching pharmacists:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: error.message || 'Failed to fetch pharmacists',
                    statusCode: 500,
                },
            });
        }
    }
    // Get pharmacist by ID (admin only)
    static async getPharmacistById(req, res) {
        try {
            const { pharmacistId } = req.params;
            if (!pharmacistId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Pharmacist ID is required',
                        statusCode: 400,
                    },
                });
            }
            const pharmacist = await pharmacistService_1.PharmacistService.getPharmacistById(pharmacistId);
            if (!pharmacist) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Pharmacist not found',
                        statusCode: 404,
                    },
                });
            }
            res.status(200).json({
                success: true,
                data: { pharmacist },
            });
        }
        catch (error) {
            console.error('Error fetching pharmacist:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: error.message || 'Failed to fetch pharmacist',
                    statusCode: 500,
                },
            });
        }
    }
    // Update pharmacist (admin only)
    static async updatePharmacist(req, res) {
        try {
            const { pharmacistId } = req.params;
            const updateData = req.body;
            if (!pharmacistId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Pharmacist ID is required',
                        statusCode: 400,
                    },
                });
            }
            const pharmacist = await pharmacistService_1.PharmacistService.updatePharmacist(pharmacistId, updateData);
            res.status(200).json({
                success: true,
                message: 'Pharmacist updated successfully',
                data: { pharmacist },
            });
        }
        catch (error) {
            console.error('Error updating pharmacist:', error);
            res.status(400).json({
                success: false,
                error: {
                    message: error.message || 'Failed to update pharmacist',
                    statusCode: 400,
                },
            });
        }
    }
    // Delete pharmacist (admin only)
    static async deletePharmacist(req, res) {
        try {
            const { pharmacistId } = req.params;
            if (!pharmacistId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Pharmacist ID is required',
                        statusCode: 400,
                    },
                });
            }
            await pharmacistService_1.PharmacistService.deletePharmacist(pharmacistId);
            res.status(200).json({
                success: true,
                message: 'Pharmacist deleted successfully',
            });
        }
        catch (error) {
            console.error('Error deleting pharmacist:', error);
            res.status(400).json({
                success: false,
                error: {
                    message: error.message || 'Failed to delete pharmacist',
                    statusCode: 400,
                },
            });
        }
    }
    // Verify pharmacist (admin only)
    static async verifyPharmacist(req, res) {
        try {
            const { pharmacistId } = req.params;
            if (!pharmacistId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Pharmacist ID is required',
                        statusCode: 400,
                    },
                });
            }
            const pharmacist = await pharmacistService_1.PharmacistService.verifyPharmacist(pharmacistId);
            res.status(200).json({
                success: true,
                message: 'Pharmacist verified successfully',
                data: { pharmacist },
            });
        }
        catch (error) {
            console.error('Error verifying pharmacist:', error);
            res.status(400).json({
                success: false,
                error: {
                    message: error.message || 'Failed to verify pharmacist',
                    statusCode: 400,
                },
            });
        }
    }
    // Unverify pharmacist (admin only)
    static async unverifyPharmacist(req, res) {
        try {
            const { pharmacistId } = req.params;
            if (!pharmacistId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Pharmacist ID is required',
                        statusCode: 400,
                    },
                });
            }
            const pharmacist = await pharmacistService_1.PharmacistService.unverifyPharmacist(pharmacistId);
            res.status(200).json({
                success: true,
                message: 'Pharmacist unverified successfully',
                data: { pharmacist },
            });
        }
        catch (error) {
            console.error('Error unverifying pharmacist:', error);
            res.status(400).json({
                success: false,
                error: {
                    message: error.message || 'Failed to unverify pharmacist',
                    statusCode: 400,
                },
            });
        }
    }
}
exports.PharmacistController = PharmacistController;
