import { Model, DataTypes, UUIDV4 } from 'sequelize';
import { sequelize } from '../database/config/database';

export interface TokenBlacklistAttributes {
  id: string;
  token: string;
  userId: string; // This will be mapped to user_id in the database
  expiresAt: Date; // This will be mapped to expires_at in the database
  createdAt?: Date; // This will be mapped to created_at in the database
  updatedAt?: Date; // This will be mapped to updated_at in the database
}

export interface TokenBlacklistCreationAttributes {
  token: string;
  userId: string;
  expiresAt: Date;
}

class TokenBlacklist extends Model<TokenBlacklistAttributes, TokenBlacklistCreationAttributes> implements TokenBlacklistAttributes {
  public id!: string;
  public token!: string;
  public userId!: string;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static method to check if token is blacklisted
  public static async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.findOne({
      where: { token },
    });
    return !!blacklistedToken;
  }

  // Static method to add token to blacklist
  public static async blacklistToken(token: string, userId: string, expiresAt: Date): Promise<void> {
    await this.create({
      token,
      userId,
      expiresAt,
    });
  }

  // Static method to clean up expired tokens
  public static async cleanupExpiredTokens(): Promise<void> {
    const { Op } = require('sequelize');
    await this.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
  }
}

// Initialize the model
TokenBlacklist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id', // Map to user_id column in database
      references: {
        model: 'users',
        key: 'id',
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at', // Map to expires_at column in database
    },
  },
  {
    sequelize,
    tableName: 'token_blacklist',
    modelName: 'TokenBlacklist',
  }
);

export default TokenBlacklist;