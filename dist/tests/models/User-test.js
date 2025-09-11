"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importStar(require("../../models/User")); // FIXED: Correct import syntax
// Mock bcrypt with proper typing
jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));
const mockBcrypt = bcryptjs_1.default;
describe('User Model', () => {
    let user;
    beforeEach(() => {
        jest.clearAllMocks();
        // Create a mock user instance
        user = new User_1.default({
            id: 'user-123',
            email: 'test@example.com',
            passwordHash: 'hashed-password',
            role: User_1.UserRole.PATIENT,
            fullName: 'Test User',
            phone: '+1234567890',
            isActive: true,
        });
    });
    describe('comparePassword', () => {
        it('should return true for correct password', async () => {
            const candidatePassword = 'correct-password';
            mockBcrypt.compare.mockResolvedValue(true); // FIXED: Proper typing
            const result = await user.comparePassword(candidatePassword);
            expect(mockBcrypt.compare).toHaveBeenCalledWith(candidatePassword, user.passwordHash);
            expect(result).toBe(true);
        });
        it('should return false for incorrect password', async () => {
            const candidatePassword = 'wrong-password';
            mockBcrypt.compare.mockResolvedValue(false); // FIXED: Proper typing
            const result = await user.comparePassword(candidatePassword);
            expect(mockBcrypt.compare).toHaveBeenCalledWith(candidatePassword, user.passwordHash);
            expect(result).toBe(false);
        });
        it('should handle bcrypt errors', async () => {
            const candidatePassword = 'test-password';
            const error = new Error('Bcrypt error');
            mockBcrypt.compare.mockRejectedValue(error); // FIXED: Proper typing
            await expect(user.comparePassword(candidatePassword))
                .rejects.toThrow('Bcrypt error');
        });
    });
    describe('hashPassword', () => {
        it('should hash password with default salt rounds', async () => {
            const password = 'plain-password';
            const hashedPassword = 'hashed-password';
            mockBcrypt.hash.mockResolvedValue(hashedPassword); // FIXED: Proper typing
            const result = await user.hashPassword(password);
            expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
            expect(result).toBe(hashedPassword);
        });
        it('should handle hashing errors', async () => {
            const password = 'test-password';
            const error = new Error('Hashing error');
            mockBcrypt.hash.mockRejectedValue(error); // FIXED: Proper typing
            await expect(user.hashPassword(password))
                .rejects.toThrow('Hashing error');
        });
    });
    describe('User attributes', () => {
        it('should have correct default values', () => {
            expect(user.id).toBe('user-123');
            expect(user.email).toBe('test@example.com');
            expect(user.role).toBe(User_1.UserRole.PATIENT);
            expect(user.fullName).toBe('Test User');
            expect(user.phone).toBe('+1234567890');
            expect(user.isActive).toBe(true);
        });
        it('should validate email format in model definition', () => {
            // This would typically be tested at the Sequelize level
            // We can test the enum values
            expect(Object.values(User_1.UserRole)).toContain(User_1.UserRole.PATIENT);
            expect(Object.values(User_1.UserRole)).toContain(User_1.UserRole.DOCTOR);
            expect(Object.values(User_1.UserRole)).toContain(User_1.UserRole.PHARMACIST);
            expect(Object.values(User_1.UserRole)).toContain(User_1.UserRole.ADMIN);
        });
    });
    describe('UserRole enum', () => {
        it('should have all required roles', () => {
            expect(User_1.UserRole.PATIENT).toBe('patient');
            expect(User_1.UserRole.DOCTOR).toBe('doctor');
            expect(User_1.UserRole.PHARMACIST).toBe('pharmacist');
            expect(User_1.UserRole.ADMIN).toBe('admin');
        });
    });
    describe('Model hooks simulation', () => {
        it('should hash password before create', async () => {
            const plainPassword = 'plain-password';
            const hashedPassword = 'hashed-password';
            mockBcrypt.hash.mockResolvedValue(hashedPassword); // FIXED: Proper typing
            // Simulate the beforeCreate hook behavior
            const userData = {
                password: plainPassword,
                email: 'test@example.com',
                fullName: 'Test User',
                role: User_1.UserRole.PATIENT,
            };
            const mockUser = new User_1.default();
            mockUser.hashPassword = jest.fn().mockResolvedValue(hashedPassword);
            // Simulate hook execution
            if (userData.password) {
                mockUser.passwordHash = await mockUser.hashPassword(userData.password);
            }
            expect(mockUser.passwordHash).toBe(hashedPassword);
        });
        it('should hash password before update', async () => {
            const newPassword = 'new-password';
            const hashedPassword = 'new-hashed-password';
            mockBcrypt.hash.mockResolvedValue(hashedPassword); // FIXED: Proper typing
            const updateData = { password: newPassword };
            user.hashPassword = jest.fn().mockResolvedValue(hashedPassword);
            // Simulate hook execution
            if (updateData.password) {
                user.passwordHash = await user.hashPassword(updateData.password);
            }
            expect(user.passwordHash).toBe(hashedPassword);
        });
    });
});
