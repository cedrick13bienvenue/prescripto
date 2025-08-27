import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';
import Prescription from './Prescription';

export interface PrescriptionItemAttributes {
  id: string;
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  instructions: string;
  createdAt?: Date;
}

export interface PrescriptionItemCreationAttributes extends Omit<PrescriptionItemAttributes, 'id' | 'createdAt'> {}

class PrescriptionItem extends Model<PrescriptionItemAttributes, PrescriptionItemCreationAttributes> implements PrescriptionItemAttributes {
  public id!: string;
  public prescriptionId!: string;
  public medicineName!: string;
  public dosage!: string;
  public frequency!: string;
  public quantity!: number;
  public instructions!: string;
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
  },
  {
    sequelize,
    tableName: 'prescription_items',
    modelName: 'PrescriptionItem',
  }
);

// Associations
PrescriptionItem.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
Prescription.hasMany(PrescriptionItem, { foreignKey: 'prescriptionId', as: 'items' });

export default PrescriptionItem;
