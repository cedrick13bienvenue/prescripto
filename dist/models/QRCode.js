"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../database/config/database");
const Prescription_1 = __importDefault(require("./Prescription"));
class QRCode extends sequelize_1.Model {
    // Check if QR code is expired
    isExpired() {
        return new Date() > this.expiresAt;
    }
    // Mark as used
    markAsUsed() {
        this.isUsed = true;
        this.scanCount += 1;
    }
}
QRCode.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.UUIDV4,
        primaryKey: true,
    },
    qrHash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    prescriptionId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'prescriptions',
            key: 'id',
        },
    },
    encryptedData: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    isUsed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    scanCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'qr_codes',
    modelName: 'QRCode',
});
// Associations
QRCode.belongsTo(Prescription_1.default, { foreignKey: 'prescriptionId', as: 'prescription' });
Prescription_1.default.hasOne(QRCode, { foreignKey: 'prescriptionId', as: 'qrCode' });
exports.default = QRCode;
