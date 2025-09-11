"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../database/config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
var UserRole;
(function (UserRole) {
    UserRole["PATIENT"] = "patient";
    UserRole["DOCTOR"] = "doctor";
    UserRole["PHARMACIST"] = "pharmacist";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
class User extends sequelize_1.Model {
    // Instance methods
    async comparePassword(candidatePassword) {
        return bcryptjs_1.default.compare(candidatePassword, this.passwordHash);
    }
    async hashPassword(password) {
        const saltRounds = 12;
        return bcryptjs_1.default.hash(password, saltRounds);
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    passwordHash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(UserRole)),
        allowNull: false,
        defaultValue: UserRole.PATIENT,
    },
    fullName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    password: {
        type: sequelize_1.DataTypes.VIRTUAL,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'users',
    modelName: 'User',
    hooks: {
        beforeCreate: async (user) => {
            const password = user.password;
            if (password) {
                user.passwordHash = await user.hashPassword(password);
            }
        },
        beforeUpdate: async (user) => {
            const password = user.password;
            if (password) {
                user.passwordHash = await user.hashPassword(password);
            }
        },
    },
});
exports.default = User;
