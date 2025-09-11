"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../database/config/database");
const User_1 = __importDefault(require("./User"));
class Patient extends sequelize_1.Model {
    // Generate reference number
    static generateReferenceNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `PAT-${year}${month}${day}-${random}`;
    }
}
Patient.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.UUIDV4,
        primaryKey: true,
    },
    referenceNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id',
        },
    },
    email: {
        type: sequelize_1.DataTypes.VIRTUAL,
        get() {
            return this.user?.email;
        },
    },
    fullName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: 'full_name',
    },
    dateOfBirth: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        field: 'date_of_birth',
    },
    gender: {
        type: sequelize_1.DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
    },
    insuranceProvider: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: 'insurance_provider',
    },
    insuranceNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
        field: 'insurance_number',
    },
    allergies: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    existingConditions: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        field: 'existing_conditions',
    },
    emergencyContact: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: 'emergency_contact',
    },
    emergencyPhone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: 'emergency_phone',
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'patients',
    modelName: 'Patient',
    hooks: {
        beforeCreate: (patient) => {
            // Always generate reference number if not provided
            if (!patient.referenceNumber) {
                patient.referenceNumber = Patient.generateReferenceNumber();
            }
        },
    },
});
// Associations
Patient.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
User_1.default.hasOne(Patient, { foreignKey: 'userId', as: 'patient' });
exports.default = Patient;
