"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teardownTestDatabase = exports.setupTestDatabase = exports.createTestDatabase = void 0;
const sequelize_1 = require("sequelize");
// Test database helper for integration tests
const createTestDatabase = () => {
    return new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: ':memory:', // In-memory database for tests
        logging: false, // Disable SQL logging during tests
    });
};
exports.createTestDatabase = createTestDatabase;
const setupTestDatabase = async (sequelize) => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Recreate tables for each test
};
exports.setupTestDatabase = setupTestDatabase;
const teardownTestDatabase = async (sequelize) => {
    await sequelize.close();
};
exports.teardownTestDatabase = teardownTestDatabase;
