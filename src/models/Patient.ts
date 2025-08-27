import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export interface PatientAttributes {
  id: string;
  referenceNumber: string;
  userId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  insuranceProvider?: string;
  insuranceNumber?: string;
  allergies: any[];
  existingConditions: any[];
  emergencyContact: string;
  emergencyPhone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatientCreationAttributes extends Omit<PatientAttributes, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt'> {}

class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  public id!: string;
  public referenceNumber!: string;
  public userId!: string;
  public fullName!: string;
  public dateOfBirth!: Date;
  public gender!: 'male' | 'female' | 'other';
  public insuranceProvider!: string;
  public insuranceNumber!: string;
  public allergies!: any[];
  public existingConditions!: any[];
  public emergencyContact!: string;
  public emergencyPhone!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Generate reference number
  public static generateReferenceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PAT-${year}${month}${day}-${random}`;
  }
}

Patient.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
    },
    insuranceProvider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    insuranceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    allergies: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    existingConditions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    emergencyContact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emergencyPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'patients',
    modelName: 'Patient',
    hooks: {
      beforeCreate: (patient: Patient) => {
        if (!patient.referenceNumber) {
          patient.referenceNumber = Patient.generateReferenceNumber();
        }
      },
    },
  }
);

// Associations
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Patient, { foreignKey: 'userId', as: 'patient' });

export default Patient;
