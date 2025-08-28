import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../database/config/database';
import Patient from './Patient';
import Doctor from './Doctor';

export enum VisitType {
  CONSULTATION = 'consultation',
  EMERGENCY = 'emergency',
  FOLLOWUP = 'followup'
}

export interface MedicalVisitAttributes {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: Date;
  visitType: VisitType;
  chiefComplaint: string;
  symptoms?: string;
  diagnosis?: string;
  treatmentNotes?: string;
  recommendations?: string;
  createdAt?: Date;
}

export interface MedicalVisitCreationAttributes extends Omit<MedicalVisitAttributes, 'id' | 'createdAt'> {}

class MedicalVisit extends Model<MedicalVisitAttributes, MedicalVisitCreationAttributes> implements MedicalVisitAttributes {
  public id!: string;
  public patientId!: string;
  public doctorId!: string;
  public visitDate!: Date;
  public visitType!: VisitType;
  public chiefComplaint!: string;
  public symptoms!: string;
  public diagnosis!: string;
  public treatmentNotes!: string;
  public recommendations!: string;
  public readonly createdAt!: Date;
}

MedicalVisit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
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
    visitDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    visitType: {
      type: DataTypes.ENUM(...Object.values(VisitType)),
      allowNull: false,
      defaultValue: VisitType.CONSULTATION,
    },
    chiefComplaint: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    symptoms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    treatmentNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'medical_visits',
    modelName: 'MedicalVisit',
  }
);

// Associations
MedicalVisit.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
MedicalVisit.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Patient.hasMany(MedicalVisit, { foreignKey: 'patientId', as: 'visits' });
Doctor.hasMany(MedicalVisit, { foreignKey: 'doctorId', as: 'visits' });

export default MedicalVisit;
