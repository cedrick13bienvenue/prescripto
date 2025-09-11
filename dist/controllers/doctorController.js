"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const doctorService_1 = require("../services/doctorService");
const authService_1 = require("../services/authService");
const models_1 = require("../models");
const common_1 = require("../types/common");
class DoctorController {
    // Register doctor (admin only)
    static async registerDoctor(req, res) {
        try {
            const data = req.body;
            // Basic validation
            if (!data.email || !data.password || !data.fullName || !data.licenseNumber || !data.specialization || !data.hospitalName) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Email, password, full name, license number, specialization, and hospital name are required',
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
                role: models_1.UserRole.DOCTOR,
                phone: data.phone,
            };
            const user = await authService_1.AuthService.register(userData);
            // Create doctor profile
            const doctor = await doctorService_1.DoctorService.createDoctorProfile({
                userId: user.user.id,
                licenseNumber: data.licenseNumber,
                specialization: data.specialization,
                hospitalName: data.hospitalName,
            });
            res.status(201).json({
                success: true,
                message: 'Doctor registered successfully',
                data: {
                    user: {
                        id: user.user.id,
                        email: user.user.email,
                        fullName: user.user.fullName,
                        role: user.user.role,
                        phone: user.user.phone,
                    },
                    doctor: {
                        id: doctor.id,
                        licenseNumber: doctor.licenseNumber,
                        specialization: doctor.specialization,
                        hospitalName: doctor.hospitalName,
                        isVerified: doctor.isVerified,
                    },
                },
            });
        }
        catch (error) {
            console.error('Doctor registration error:', error);
            res.status(400).json({
                success: false,
                error: {
                    message: error.message || 'Doctor registration failed',
                    statusCode: 400,
                },
            });
        }
    }
    // Get all doctors with pagination (admin only)
    static async getAllDoctors(req, res) {
        try {
            const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const result = await doctorService_1.DoctorService.getAllDoctors(pageNum, limitNum, sortBy, sortOrder);
            res.status(200).json({
                success: true,
                data: result.doctors,
                pagination: (0, common_1.createPaginationResponse)(pageNum, limitNum, result.total),
            });
        }
        catch (error) {
            console.error('Get doctors error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: error.message || 'Failed to fetch doctors',
                    statusCode: 500,
                },
            });
        }
    }
    // Get doctor by ID (admin only)
    static async getDoctorById(req, res) {
        try {
            const { doctorId } = req.params;
            if (!doctorId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Doctor ID is required',
                        statusCode: 400,
                    },
                });
            }
            const doctor = await doctorService_1.DoctorService.getDoctorById(doctorId);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Doctor not found',
                        statusCode: 404,
                    },
                });
            }
            res.status(200).json({
                success: true,
                data: doctor,
            });
        }
        catch (error) {
            console.error('Get doctor error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: error.message || 'Failed to fetch doctor',
                    statusCode: 500,
                },
            });
        }
    }
    // Update doctor profile (admin only)
    static async updateDoctorProfile(req, res) {
        try {
            const { doctorId } = req.params;
            const updateData = req.body;
            if (!doctorId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Doctor ID is required',
                        statusCode: 400,
                    },
                });
            }
            const doctor = await doctorService_1.DoctorService.updateDoctorProfile(doctorId, updateData);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Doctor not found',
                        statusCode: 404,
                    },
                });
            }
            res.status(200).json({
                success: true,
                message: 'Doctor profile updated successfully',
                data: doctor,
            });
        }
        catch (error) {
            console.error('Update doctor error:', error);
            res.status(400).json({
                success: false,
                error: {
                    message: error.message || 'Failed to update doctor',
                    statusCode: 400,
                },
            });
        }
    }
    // Delete doctor (admin only)
    static async deleteDoctor(req, res) {
        try {
            const { doctorId } = req.params;
            if (!doctorId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Doctor ID is required',
                        statusCode: 400,
                    },
                });
            }
            const deleted = await doctorService_1.DoctorService.deleteDoctor(doctorId);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Doctor not found',
                        statusCode: 404,
                    },
                });
            }
            res.status(200).json({
                success: true,
                message: 'Doctor deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete doctor error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: error.message || 'Failed to delete doctor',
                    statusCode: 500,
                },
            });
        }
    }
}
exports.DoctorController = DoctorController;
