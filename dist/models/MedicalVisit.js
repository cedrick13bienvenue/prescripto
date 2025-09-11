"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitType = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../database/config/database");
const Patient_1 = __importDefault(require("./Patient"));
const Doctor_1 = __importDefault(require("./Doctor"));
var VisitType;
(function (VisitType) {
    VisitType["CONSULTATION"] = "consultation";
    VisitType["EMERGENCY"] = "emergency";
    VisitType["FOLLOWUP"] = "followup";
})(VisitType || (exports.VisitType = VisitType = {}));
class MedicalVisit extends sequelize_1.Model {
}
MedicalVisit.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.UUIDV4,
        primaryKey: true,
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
    visitDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    visitType: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(VisitType)),
        allowNull: false,
        defaultValue: VisitType.CONSULTATION,
    },
    chiefComplaint: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    symptoms: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    diagnosis: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    treatmentNotes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    recommendations: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'medical_visits',
    modelName: 'MedicalVisit',
});
// Associations
MedicalVisit.belongsTo(Patient_1.default, { foreignKey: 'patientId', as: 'patient' });
MedicalVisit.belongsTo(Doctor_1.default, { foreignKey: 'doctorId', as: 'doctor' });
Patient_1.default.hasMany(MedicalVisit, { foreignKey: 'patientId', as: 'visits' });
Doctor_1.default.hasMany(MedicalVisit, { foreignKey: 'doctorId', as: 'visits' });
exports.default = MedicalVisit;
