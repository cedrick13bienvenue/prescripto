"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../database/config/database");
class TokenBlacklist extends sequelize_1.Model {
    // Static method to check if token is blacklisted
    static async isTokenBlacklisted(token) {
        const blacklistedToken = await this.findOne({
            where: { token },
        });
        return !!blacklistedToken;
    }
    // Static method to add token to blacklist
    static async blacklistToken(token, userId, expiresAt) {
        await this.create({
            token,
            userId,
            expiresAt,
        });
    }
    // Static method to clean up expired tokens
    static async cleanupExpiredTokens() {
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
TokenBlacklist.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.UUIDV4,
        primaryKey: true,
    },
    token: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        field: 'user_id', // Map to user_id column in database
        references: {
            model: 'users',
            key: 'id',
        },
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: 'expires_at', // Map to expires_at column in database
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'token_blacklist',
    modelName: 'TokenBlacklist',
});
exports.default = TokenBlacklist;
