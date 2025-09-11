"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load test environment variables
dotenv_1.default.config({ path: '.env.test' });
// Mock console methods to reduce noise during testing
const originalConsole = global.console;
beforeAll(() => {
    global.console = {
        ...originalConsole,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: originalConsole.error, // Keep error for debugging
    };
});
afterAll(() => {
    global.console = originalConsole;
});
// Set test timeout
jest.setTimeout(10000);
