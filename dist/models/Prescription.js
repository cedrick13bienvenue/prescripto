"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionStatus = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../database/config/database");
const Patient_1 = __importDefault(require("./Patient"));
const Doctor_1 = __importDefault(require("./Doctor"));
const MedicalVisit_1 = __importDefault(require("./MedicalVisit"));
var PrescriptionStatus;
(function (PrescriptionStatus) {
    PrescriptionStatus["PENDING"] = "pending";
    PrescriptionStatus["SCANNED"] = "scanned";
    PrescriptionStatus["VALIDATED"] = "validated";
    PrescriptionStatus["DISPENSED"] = "dispensed";
    PrescriptionStatus["REJECTED"] = "rejected";
    PrescriptionStatus["FULFILLED"] = "fulfilled";
    PrescriptionStatus["CANCELLED"] = "cancelled"; // Prescription was cancelled
})(PrescriptionStatus || (exports.PrescriptionStatus = PrescriptionStatus = {}));
class Prescription extends sequelize_1.Model {
    // Generate prescription number
    static generatePrescriptionNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `RX-${year}${month}${day}-${random}`;
    }
}
Prescription.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.UUIDV4,
        primaryKey: true,
    },
    prescriptionNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    patientId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id',
        },
    },
    doctorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'doctors',
            key: 'id',
        },
    },
    visitId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'medical_visits',
            key: 'id',
        },
    },
    diagnosis: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    doctorNotes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(PrescriptionStatus)),
        allowNull: false,
        defaultValue: PrescriptionStatus.PENDING,
    },
    qrCodeHash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'prescriptions',
    modelName: 'Prescription',
    hooks: {
        beforeCreate: (prescription) => {
            if (!prescription.prescriptionNumber) {
                prescription.prescriptionNumber = Prescription.generatePrescriptionNumber();
            }
        },
    },
});
// Associations
Prescription.belongsTo(Patient_1.default, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(Doctor_1.default, { foreignKey: 'doctorId', as: 'doctor' });
Prescription.belongsTo(MedicalVisit_1.default, { foreignKey: 'visitId', as: 'visit' });
Patient_1.default.hasMany(Prescription, { foreignKey: 'patientId', as: 'prescriptions' });
Doctor_1.default.hasMany(Prescription, { foreignKey: 'doctorId', as: 'prescriptions' });
MedicalVisit_1.default.hasMany(Prescription, { foreignKey: 'visitId', as: 'prescriptions' });
exports.default = Prescription;
