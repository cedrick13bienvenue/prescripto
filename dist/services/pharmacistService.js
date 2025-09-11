"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacistService = void 0;
const Pharmacist_1 = __importDefault(require("../models/Pharmacist"));
const models_1 = require("../models");
class PharmacistService {
    // Create pharmacist profile
    static async createPharmacistProfile(data) {
        try {
            const pharmacist = await Pharmacist_1.default.create({
                userId: data.userId,
                licenseNumber: data.licenseNumber,
                pharmacyName: data.pharmacyName,
                pharmacyAddress: data.pharmacyAddress,
                isVerified: true, // Auto-verify when created by admin
            });
            // Return the created pharmacist with user info
            return await this.getPharmacistById(pharmacist.id);
        }
        catch (error) {
            console.error('Error creating pharmacist profile:', error);
            throw error;
        }
    }
    // Get pharmacist by ID with user information
    static async getPharmacistById(pharmacistId) {
        try {
            const pharmacist = await Pharmacist_1.default.findByPk(pharmacistId, {
                include: [
                    {
                        model: models_1.User,
                        as: 'user',
                        attributes: ['id', 'email', 'fullName', 'phone', 'role', 'isActive', 'createdAt']
                    }
                ]
            });
            if (!pharmacist) {
                return null;
            }
            return {
                id: pharmacist.id,
                userId: pharmacist.userId,
                email: pharmacist.user?.email || '',
                fullName: pharmacist.user?.fullName || '',
                phone: pharmacist.user?.phone,
                role: pharmacist.user?.role || 'pharmacist',
                licenseNumber: pharmacist.licenseNumber,
                pharmacyName: pharmacist.pharmacyName,
                pharmacyAddress: pharmacist.pharmacyAddress,
                isVerified: pharmacist.isVerified,
                createdAt: pharmacist.createdAt,
            };
        }
        catch (error) {
            console.error('Error fetching pharmacist by ID:', error);
            throw error;
        }
    }
    // Get pharmacist by user ID
    static async getPharmacistByUserId(userId) {
        try {
            const pharmacist = await Pharmacist_1.default.findOne({
                where: { userId },
                include: [
                    {
                        model: models_1.User,
                        as: 'user',
                        attributes: ['id', 'email', 'fullName', 'phone', 'role', 'isActive', 'createdAt']
                    }
                ]
            });
            if (!pharmacist) {
                return null;
            }
            return {
                id: pharmacist.id,
                userId: pharmacist.userId,
                email: pharmacist.user?.email || '',
                fullName: pharmacist.user?.fullName || '',
                phone: pharmacist.user?.phone,
                role: pharmacist.user?.role || 'pharmacist',
                licenseNumber: pharmacist.licenseNumber,
                pharmacyName: pharmacist.pharmacyName,
                pharmacyAddress: pharmacist.pharmacyAddress,
                isVerified: pharmacist.isVerified,
                createdAt: pharmacist.createdAt,
            };
        }
        catch (error) {
            console.error('Error fetching pharmacist by user ID:', error);
            throw error;
        }
    }
    // Get all pharmacists with pagination
    static async getAllPharmacists(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await Pharmacist_1.default.findAndCountAll({
                include: [
                    {
                        model: models_1.User,
                        as: 'user',
                        attributes: ['id', 'email', 'fullName', 'phone', 'role', 'isActive', 'createdAt']
                    }
                ],
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });
            const pharmacists = rows.map(pharmacist => ({
                id: pharmacist.id,
                userId: pharmacist.userId,
                email: pharmacist.user?.email || '',
                fullName: pharmacist.user?.fullName || '',
                phone: pharmacist.user?.phone,
                role: pharmacist.user?.role || 'pharmacist',
                licenseNumber: pharmacist.licenseNumber,
                pharmacyName: pharmacist.pharmacyName,
                pharmacyAddress: pharmacist.pharmacyAddress,
                isVerified: pharmacist.isVerified,
                createdAt: pharmacist.createdAt,
            }));
            const totalPages = Math.ceil(count / limit);
            return {
                pharmacists,
                total: count,
                pagination: {
                    page,
                    limit,
                    totalPages
                }
            };
        }
        catch (error) {
            console.error('Error fetching all pharmacists:', error);
            throw error;
        }
    }
    // Update pharmacist profile
    static async updatePharmacist(pharmacistId, data) {
        try {
            const pharmacist = await Pharmacist_1.default.findByPk(pharmacistId);
            if (!pharmacist) {
                throw new Error('Pharmacist not found');
            }
            await pharmacist.update(data);
            // Return updated pharmacist with user info
            return await this.getPharmacistById(pharmacistId);
        }
        catch (error) {
            console.error('Error updating pharmacist:', error);
            throw error;
        }
    }
    // Delete pharmacist
    static async deletePharmacist(pharmacistId) {
        try {
            const pharmacist = await Pharmacist_1.default.findByPk(pharmacistId);
            if (!pharmacist) {
                throw new Error('Pharmacist not found');
            }
            // Get the associated user ID before deleting
            const userId = pharmacist.userId;
            // Delete the pharmacist profile
            await pharmacist.destroy();
            // Also deactivate the associated user account
            await models_1.User.update({ isActive: false }, { where: { id: userId } });
        }
        catch (error) {
            console.error('Error deleting pharmacist:', error);
            throw error;
        }
    }
    // Verify pharmacist
    static async verifyPharmacist(pharmacistId) {
        try {
            const pharmacist = await Pharmacist_1.default.findByPk(pharmacistId);
            if (!pharmacist) {
                throw new Error('Pharmacist not found');
            }
            await pharmacist.update({ isVerified: true });
            return await this.getPharmacistById(pharmacistId);
        }
        catch (error) {
            console.error('Error verifying pharmacist:', error);
            throw error;
        }
    }
    // Unverify pharmacist
    static async unverifyPharmacist(pharmacistId) {
        try {
            const pharmacist = await Pharmacist_1.default.findByPk(pharmacistId);
            if (!pharmacist) {
                throw new Error('Pharmacist not found');
            }
            await pharmacist.update({ isVerified: false });
            return await this.getPharmacistById(pharmacistId);
        }
        catch (error) {
            console.error('Error unverifying pharmacist:', error);
            throw error;
        }
    }
}
exports.PharmacistService = PharmacistService;
