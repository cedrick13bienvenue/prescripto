import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../database/config/database';
import User from './User';

export interface PatientAttributes {
  id: string;
  referenceNumber?: string; // Made optional to allow auto-generation
  userId: string;
  email: string; // Email from associated user
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

export type PatientCreationAttributes = Omit<PatientAttributes, 'id' | 'email' | 'createdAt' | 'updatedAt'>

class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  public id!: string;
  public referenceNumber?: string;
  public userId!: string;
  public email!: string; // Email from associated user
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
  public static generateReferenceNumber (): string {
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
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    email: {
      type: DataTypes.VIRTUAL,
      get() {
        return (this as any).user?.email;
      },
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'full_name',
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'date_of_birth',
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
    },
    insuranceProvider: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'insurance_provider',
    },
    insuranceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: 'insurance_number',
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
      field: 'existing_conditions',
    },
    emergencyContact: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'emergency_contact',
    },
    emergencyPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'emergency_phone',
    },
  },
  {
    sequelize,
    tableName: 'patients',
    modelName: 'Patient',
    hooks: {
      beforeCreate: (patient: Patient) => {
        // Always generate reference number if not provided
        if (!patient.referenceNumber) {
          patient.referenceNumber = Patient.generateReferenceNumber();
        }
      },
    },
  },
);

// Associations
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Patient, { foreignKey: 'userId', as: 'patient' });

export default Patient;
