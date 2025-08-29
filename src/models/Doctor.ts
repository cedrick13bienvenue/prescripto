import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../database/config/database';
import User from './User';

export interface DoctorAttributes {
  id: string;
  userId: string;
  licenseNumber: string;
  specialization: string;
  hospitalName: string;
  isVerified: boolean;
  createdAt?: Date;
}

export type DoctorCreationAttributes = Omit<DoctorAttributes, 'id' | 'createdAt'>

class Doctor extends Model<DoctorAttributes, DoctorCreationAttributes> implements DoctorAttributes {
  public id!: string;
  public userId!: string;
  public licenseNumber!: string;
  public specialization!: string;
  public hospitalName!: string;
  public isVerified!: boolean;
  public readonly createdAt!: Date;
}

Doctor.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hospitalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'doctors',
    modelName: 'Doctor',
  },
);

// Associations
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctor' });

export default Doctor;
