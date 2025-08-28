import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../database/config/database';
import Prescription from './Prescription';

export interface QRCodeAttributes {
  id: string;
  qrHash: string;
  prescriptionId: string;
  encryptedData: string;
  expiresAt: Date;
  isUsed: boolean;
  scanCount: number;
  createdAt?: Date;
}

export interface QRCodeCreationAttributes extends Omit<QRCodeAttributes, 'id' | 'scanCount' | 'createdAt'> {}

class QRCode extends Model<QRCodeAttributes, QRCodeCreationAttributes> implements QRCodeAttributes {
  public id!: string;
  public qrHash!: string;
  public prescriptionId!: string;
  public encryptedData!: string;
  public expiresAt!: Date;
  public isUsed!: boolean;
  public scanCount!: number;
  public readonly createdAt!: Date;

  // Check if QR code is expired
  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  // Mark as used
  public markAsUsed(): void {
    this.isUsed = true;
    this.scanCount += 1;
  }
}

QRCode.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    qrHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    prescriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'prescriptions',
        key: 'id',
      },
    },
    encryptedData: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    scanCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'qr_codes',
    modelName: 'QRCode',
  }
);

// Associations
QRCode.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
Prescription.hasOne(QRCode, { foreignKey: 'prescriptionId', as: 'qrCode' });

export default QRCode;
