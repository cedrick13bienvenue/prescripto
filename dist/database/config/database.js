"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.connectDatabase = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Database configuration
const dbConfig = {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    database: process.env['DB_NAME'] || 'medconnect_db',
    username: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || 'your_password',
    dialect: 'postgres',
    logging: process.env['NODE_ENV'] === 'development' ? console.log : false,
    pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    },
    // Add SSL configuration for production
    dialectOptions: process.env['NODE_ENV'] === 'production' ? {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    } : {},
};
// Create Sequelize instance
exports.sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions,
});
// Test database connection
const connectDatabase = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log('✅ Database connection established successfully');
        // Sync database (in development - will be replaced with migrations later)
        // if (process.env['NODE_ENV'] === 'development') {
        //   await sequelize.sync({ alter: true });
        //   console.log('🔄 Database sync completed');
        // }
    }
    catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
// Close database connection
const closeDatabase = async () => {
    try {
        await exports.sequelize.close();
        console.log('🔌 Database connection closed');
    }
    catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
};
exports.closeDatabase = closeDatabase;
exports.default = exports.sequelize;
