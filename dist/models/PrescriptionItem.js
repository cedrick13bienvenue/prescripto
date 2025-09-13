"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../database/config/database");
const Prescription_1 = __importDefault(require("./Prescription"));
class PrescriptionItem extends sequelize_1.Model {
}
PrescriptionItem.init({
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
    medicineName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    dosage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    frequency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    instructions: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    // Inventory tracking
    dispensedQuantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    unitPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
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
    isDispensed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'prescription_items',
    modelName: 'PrescriptionItem',
});
// Associations
PrescriptionItem.belongsTo(Prescription_1.default, { foreignKey: 'prescriptionId', as: 'prescription' });
Prescription_1.default.hasMany(PrescriptionItem, { foreignKey: 'prescriptionId', as: 'items' });
exports.default = PrescriptionItem;
