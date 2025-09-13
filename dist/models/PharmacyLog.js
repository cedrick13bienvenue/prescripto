"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacyAction = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../database/config/database");
const Prescription_1 = __importDefault(require("./Prescription"));
const User_1 = __importDefault(require("./User"));
var PharmacyAction;
(function (PharmacyAction) {
    PharmacyAction["SCANNED"] = "scanned";
    PharmacyAction["VALIDATED"] = "validated";
    PharmacyAction["DISPENSED"] = "dispensed";
    PharmacyAction["FULFILLED"] = "fulfilled";
})(PharmacyAction || (exports.PharmacyAction = PharmacyAction = {}));
class PharmacyLog extends sequelize_1.Model {
}
PharmacyLog.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.UUIDV4,
        primaryKey: true,
    },
    prescriptionId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'prescriptions',
            key: 'id',
        },
    },
    pharmacistId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    action: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(PharmacyAction)),
        allowNull: false,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    actionTimestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    // Dispensing details
    dispensedQuantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    unitPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    totalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    insuranceCoverage: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    patientPayment: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    insuranceProvider: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    insuranceNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    insuranceApprovalCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    batchNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    expiryDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'pharmacy_logs',
    modelName: 'PharmacyLog',
});
// Associations
PharmacyLog.belongsTo(Prescription_1.default, { foreignKey: 'prescriptionId', as: 'prescription' });
PharmacyLog.belongsTo(User_1.default, { foreignKey: 'pharmacistId', as: 'pharmacist' });
Prescription_1.default.hasMany(PharmacyLog, { foreignKey: 'prescriptionId', as: 'pharmacyLogs' });
User_1.default.hasMany(PharmacyLog, { foreignKey: 'pharmacistId', as: 'pharmacyLogs' });
exports.default = PharmacyLog;
