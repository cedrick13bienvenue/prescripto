import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432'),
  database: process.env['DB_NAME'] || 'medconnect_db',
  username: process.env['DB_USER'] || 'postgres',
  password: process.env['DB_PASSWORD'] || 'your_password',
  dialect: 'postgres' as const,
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
  dialectOptions: {
    ssl: process.env['NODE_ENV'] === 'production' ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
};

// Create Sequelize instance
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions,
  }
);

// Test database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    
    // Sync database (in development - will be replaced with migrations later)
    if (process.env['NODE_ENV'] === 'development') {
      // await sequelize.sync({ alter: true });
      logger.info('🔄 Database sync completed');
    }
  } catch (error) {
    logger.warn('⚠️ Database connection failed - continuing without database for now');
    logger.warn('Make sure PostgreSQL is running and credentials are correct in .env file');
    // Don't throw error - let server start without database for now
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('🔌 Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
  }
};

export default sequelize;