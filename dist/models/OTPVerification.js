"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../database/config/database");
class OTPVerification extends sequelize_1.Model {
    // Check if OTP is expired
    isExpired() {
        return new Date() > this.expiresAt;
    }
    // Check if OTP is valid (not expired and not used)
    isValid() {
        return !this.isExpired() && !this.isUsed;
    }
    // Generate a 6-digit OTP code
    static generateOTPCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    // Clean up expired OTPs
    static async cleanupExpiredOTPs() {
        try {
            await OTPVerification.destroy({
                where: {
                    expiresAt: {
                        [sequelize_1.Op.lt]: new Date()
                    }
                }
            });
            console.log('✅ Expired OTPs cleaned up successfully');
        }
        catch (error) {
            console.error('❌ Failed to cleanup expired OTPs:', error);
        }
    }
    // Find valid OTP by code and patient ID
    static async findValidOTP(otpCode, patientId) {
        const otp = await OTPVerification.findOne({
            where: {
                otpCode,
                patientId,
                isUsed: false
            }
        });
        if (!otp || otp.isExpired()) {
            return null;
        }
        return otp;
    }
}
OTPVerification.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.UUIDV4,
        primaryKey: true,
    },
    patientId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        field: 'patient_id',
        references: {
            model: 'patients',
            key: 'id',
        },
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    otpCode: {
        type: sequelize_1.DataTypes.STRING(6),
        allowNull: false,
        field: 'otp_code',
    },
    purpose: {
        type: sequelize_1.DataTypes.ENUM('medical_history_access'),
        allowNull: false,
        defaultValue: 'medical_history_access',
    },
    isUsed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_used',
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'otp_verifications',
    modelName: 'OTPVerification',
    indexes: [
        {
            fields: ['patient_id', 'otp_code'],
            unique: true,
        },
        {
            fields: ['expires_at'],
        },
    ],
});
exports.default = OTPVerification;
