import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../database/config/database';
import Patient from './Patient';
import Doctor from './Doctor';
import MedicalVisit from './MedicalVisit';

export enum PrescriptionStatus {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled'
}

export interface PrescriptionAttributes {
  id: string;
  prescriptionNumber?: string; // Made optional to allow auto-generation
  patientId: string;
  doctorId: string;
  visitId: string;
  diagnosis?: string;
  doctorNotes?: string;
  status: PrescriptionStatus;
  qrCodeHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PrescriptionCreationAttributes = Omit<PrescriptionAttributes, 'id' | 'createdAt' | 'updatedAt'>

class Prescription extends Model<PrescriptionAttributes, PrescriptionCreationAttributes> implements PrescriptionAttributes {
  public id!: string;
  public prescriptionNumber?: string;
  public patientId!: string;
  public doctorId!: string;
  public visitId!: string;
  public diagnosis!: string;
  public doctorNotes!: string;
  public status!: PrescriptionStatus;
  public qrCodeHash!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Generate prescription number
  public static generatePrescriptionNumber (): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RX-${year}${month}${day}-${random}`;
  }
}

Prescription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    prescriptionNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'id',
      },
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id',
      },
    },
    visitId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'medical_visits',
        key: 'id',
      },
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    doctorNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PrescriptionStatus)),
      allowNull: false,
      defaultValue: PrescriptionStatus.PENDING,
    },
    qrCodeHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'prescriptions',
    modelName: 'Prescription',
    hooks: {
      beforeCreate: (prescription: Prescription) => {
        if (!prescription.prescriptionNumber) {
          prescription.prescriptionNumber = Prescription.generatePrescriptionNumber();
        }
      },
    },
  },
);

// Associations
Prescription.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Prescription.belongsTo(MedicalVisit, { foreignKey: 'visitId', as: 'visit' });

Patient.hasMany(Prescription, { foreignKey: 'patientId', as: 'prescriptions' });
Doctor.hasMany(Prescription, { foreignKey: 'doctorId', as: 'prescriptions' });
MedicalVisit.hasMany(Prescription, { foreignKey: 'visitId', as: 'prescriptions' });

export default Prescription;
