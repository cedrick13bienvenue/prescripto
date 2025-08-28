import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../database/config/database';
import Prescription from './Prescription';
import User from './User';

export enum PharmacyAction {
  SCANNED = 'scanned',
  VALIDATED = 'validated',
  FULFILLED = 'fulfilled'
}

export interface PharmacyLogAttributes {
  id: string;
  prescriptionId: string;
  pharmacistId: string;
  action: PharmacyAction;
  notes?: string;
  actionTimestamp: Date;
  createdAt?: Date;
}

export interface PharmacyLogCreationAttributes extends Omit<PharmacyLogAttributes, 'id' | 'actionTimestamp' | 'createdAt'> {}

class PharmacyLog extends Model<PharmacyLogAttributes, PharmacyLogCreationAttributes> implements PharmacyLogAttributes {
  public id!: string;
  public prescriptionId!: string;
  public pharmacistId!: string;
  public action!: PharmacyAction;
  public notes!: string;
  public actionTimestamp!: Date;
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
  },
  {
    sequelize,
    tableName: 'pharmacy_logs',
    modelName: 'PharmacyLog',
  }
);

// Associations
PharmacyLog.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
PharmacyLog.belongsTo(User, { foreignKey: 'pharmacistId', as: 'pharmacist' });

Prescription.hasMany(PharmacyLog, { foreignKey: 'prescriptionId', as: 'pharmacyLogs' });
User.hasMany(PharmacyLog, { foreignKey: 'pharmacistId', as: 'pharmacyLogs' });

export default PharmacyLog;
