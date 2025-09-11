"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../database/config/database");
const User_1 = __importDefault(require("./User"));
class Doctor extends sequelize_1.Model {
}
Doctor.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.UUIDV4,
        primaryKey: true,
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
        type: sequelize_1.DataTypes.VIRTUAL,
        get() {
            return this.user?.fullName;
        },
    },
    licenseNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
        field: 'license_number',
    },
    specialization: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    hospitalName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: 'hospital_name',
    },
    isVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_verified',
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'doctors',
    modelName: 'Doctor',
});
// Associations
Doctor.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
User_1.default.hasOne(Doctor, { foreignKey: 'userId', as: 'doctor' });
exports.default = Doctor;
