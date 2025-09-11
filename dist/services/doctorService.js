"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorService = void 0;
const Doctor_1 = __importDefault(require("../models/Doctor"));
const models_1 = require("../models");
class DoctorService {
    // Create doctor profile
    static async createDoctorProfile(data) {
        try {
            const doctor = await Doctor_1.default.create({
                userId: data.userId,
                licenseNumber: data.licenseNumber,
                specialization: data.specialization,
                hospitalName: data.hospitalName,
                isVerified: true, // Auto-verify when created by admin
            });
            // Return the created doctor with user info
            return await this.getDoctorById(doctor.id);
        }
        catch (error) {
            console.error('Error creating doctor profile:', error);
            throw error;
        }
    }
    // Get doctor by ID with user information
    static async getDoctorById(doctorId) {
        try {
            const doctor = await Doctor_1.default.findByPk(doctorId, {
                include: [{
                        association: 'user',
                        attributes: ['email', 'fullName', 'phone']
                    }]
            });
            if (!doctor) {
                return null;
            }
            return {
                id: doctor.id,
                userId: doctor.userId,
                email: doctor.email,
                fullName: doctor.fullName,
                licenseNumber: doctor.licenseNumber,
                specialization: doctor.specialization,
                hospitalName: doctor.hospitalName,
                isVerified: doctor.isVerified,
                phone: doctor.user?.phone,
                createdAt: doctor.createdAt,
            };
        }
        catch (error) {
            console.error('Error getting doctor by ID:', error);
            throw error;
        }
    }
    // Get doctor by user ID
    static async getDoctorByUserId(userId) {
        try {
            const doctor = await Doctor_1.default.findOne({
                where: { userId },
                include: [{
                        association: 'user',
                        attributes: ['email', 'fullName', 'phone']
                    }]
            });
            if (!doctor) {
                return null;
            }
            return {
                id: doctor.id,
                userId: doctor.userId,
                email: doctor.email,
                fullName: doctor.fullName,
                licenseNumber: doctor.licenseNumber,
                specialization: doctor.specialization,
                hospitalName: doctor.hospitalName,
                isVerified: doctor.isVerified,
                phone: doctor.user?.phone,
                createdAt: doctor.createdAt,
            };
        }
        catch (error) {
            console.error('Error getting doctor by user ID:', error);
            throw error;
        }
    }
    // Get all doctors with pagination
    static async getAllDoctors(page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC') {
        try {
            const offset = (page - 1) * limit;
            const { count, rows: doctors } = await Doctor_1.default.findAndCountAll({
                include: [{
                        association: 'user',
                        attributes: ['email', 'fullName', 'phone', 'isActive'],
                        where: { isActive: true }
                    }],
                limit,
                offset,
                order: [[sortBy, sortOrder]],
            });
            const doctorProfiles = doctors.map(doctor => ({
                id: doctor.id,
                userId: doctor.userId,
                email: doctor.email,
                fullName: doctor.fullName,
                licenseNumber: doctor.licenseNumber,
                specialization: doctor.specialization,
                hospitalName: doctor.hospitalName,
                isVerified: doctor.isVerified,
                phone: doctor.user?.phone,
                createdAt: doctor.createdAt,
            }));
            return {
                doctors: doctorProfiles,
                total: count
            };
        }
        catch (error) {
            console.error('Error getting all doctors:', error);
            throw error;
        }
    }
    // Update doctor profile
    static async updateDoctorProfile(doctorId, updateData) {
        try {
            const doctor = await Doctor_1.default.findByPk(doctorId);
            if (!doctor) {
                return null;
            }
            await doctor.update(updateData);
            // Return updated doctor with user info
            return await this.getDoctorById(doctorId);
        }
        catch (error) {
            console.error('Error updating doctor profile:', error);
            throw error;
        }
    }
    // Delete doctor profile
    static async deleteDoctor(doctorId) {
        try {
            const doctor = await Doctor_1.default.findByPk(doctorId);
            if (!doctor) {
                return false;
            }
            // Get the associated user ID before deleting
            const userId = doctor.userId;
            // Delete the doctor profile
            await doctor.destroy();
            // Also deactivate the associated user account
            await models_1.User.update({ isActive: false }, { where: { id: userId } });
            return true;
        }
        catch (error) {
            console.error('Error deleting doctor:', error);
            throw error;
        }
    }
}
exports.DoctorService = DoctorService;
