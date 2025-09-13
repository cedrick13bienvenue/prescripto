import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../database/config/database';
import Prescription from './Prescription';

export interface PrescriptionItemAttributes {
  id: string;
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  instructions: string;
  // Inventory tracking
  dispensedQuantity?: number;
  unitPrice?: number;
  batchNumber?: string;
  expiryDate?: Date;
  isDispensed?: boolean;
  createdAt?: Date;
}

export type PrescriptionItemCreationAttributes = Omit<PrescriptionItemAttributes, 'id' | 'createdAt'>

class PrescriptionItem extends Model<PrescriptionItemAttributes, PrescriptionItemCreationAttributes> implements PrescriptionItemAttributes {
  public id!: string;
  public prescriptionId!: string;
  public medicineName!: string;
  public dosage!: string;
  public frequency!: string;
  public quantity!: number;
  public instructions!: string;
  // Inventory tracking
  public dispensedQuantity!: number;
  public unitPrice!: number;
  public batchNumber!: string;
  public expiryDate!: Date;
  public isDispensed!: boolean;
  public readonly createdAt!: Date;
}

PrescriptionItem.init(
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
    medicineName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Inventory tracking
    dispensedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
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
    isDispensed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'prescription_items',
    modelName: 'PrescriptionItem',
  },
);

// Associations
PrescriptionItem.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
Prescription.hasMany(PrescriptionItem, { foreignKey: 'prescriptionId', as: 'items' });

export default PrescriptionItem;
