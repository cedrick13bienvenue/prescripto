import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../database/config/database';
import Prescription from './Prescription';
import User from './User';

export enum PharmacyAction {
  SCAN = 'scan',
  SCANNED = 'scanned',
  VALIDATED = 'validated',
  DISPENSED = 'dispensed',
  FULFILLED = 'fulfilled'
}

export interface PharmacyLogAttributes {
  id: string;
  prescriptionId: string;
  pharmacistId: string;
  action: PharmacyAction;
  notes?: string;
  actionTimestamp: Date;
  // Dispensing details
  dispensedQuantity?: number;
  unitPrice?: number;
  totalAmount?: number;
  insuranceCoverage?: number;
  patientPayment?: number;
  insuranceProvider?: string;
  insuranceNumber?: string;
  insuranceApprovalCode?: string;
  batchNumber?: string;
  expiryDate?: Date;
  createdAt?: Date;
}

export type PharmacyLogCreationAttributes = Omit<PharmacyLogAttributes, 'id' | 'actionTimestamp' | 'createdAt'>

class PharmacyLog extends Model<PharmacyLogAttributes, PharmacyLogCreationAttributes> implements PharmacyLogAttributes {
  public id!: string;
  public prescriptionId!: string;
  public pharmacistId!: string;
  public action!: PharmacyAction;
  public notes!: string;
  public actionTimestamp!: Date;
  // Dispensing details
  public dispensedQuantity!: number;
  public unitPrice!: number;
  public totalAmount!: number;
  public insuranceCoverage!: number;
  public patientPayment!: number;
  public insuranceProvider!: string;
  public insuranceNumber!: string;
  public insuranceApprovalCode!: string;
  public batchNumber!: string;
  public expiryDate!: Date;
  public readonly createdAt!: Date;
}

PharmacyLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    prescriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'prescriptions',
        key: 'id',
      },
    },
    pharmacistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.ENUM(...Object.values(PharmacyAction)),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    actionTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // Dispensing details
    dispensedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    insuranceCoverage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    patientPayment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    insuranceProvider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    insuranceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    insuranceApprovalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    batchNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'pharmacy_logs',
    modelName: 'PharmacyLog',
  },
);

// Associations
PharmacyLog.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
PharmacyLog.belongsTo(User, { foreignKey: 'pharmacistId', as: 'pharmacist' });

Prescription.hasMany(PharmacyLog, { foreignKey: 'prescriptionId', as: 'pharmacyLogs' });
User.hasMany(PharmacyLog, { foreignKey: 'pharmacistId', as: 'pharmacyLogs' });

export default PharmacyLog;
