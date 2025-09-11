"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authController_1 = require("../../controllers/authController");
const authService_1 = require("../../services/authService");
const models_1 = require("../../models");
// Mock the AuthService
jest.mock('../../src/services/authService');
const MockAuthService = authService_1.AuthService;
describe('AuthController', () => {
    let mockReq;
    let mockRes;
    beforeEach(() => {
        mockReq = {
            body: {},
            params: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });
    describe('login', () => {
        it('should successfully login a user', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123',
            };
            const mockAuthResponse = {
                user: {
                    id: 'user-123',
                    email: credentials.email,
                    fullName: 'Test User',
                    role: models_1.UserRole.PATIENT,
                },
                token: 'mock-token',
            };
            mockReq.body = credentials;
            MockAuthService.login.mockResolvedValue(mockAuthResponse);
            await authController_1.AuthController.login(mockReq, mockRes);
            expect(MockAuthService.login).toHaveBeenCalledWith(credentials);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Login successful',
                data: mockAuthResponse,
            });
        });
        it('should return 400 if credentials are missing', async () => {
            mockReq.body = {
                email: 'test@example.com',
                // missing password
            };
            await authController_1.AuthController.login(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Email and password are required',
                    statusCode: 400,
                },
            });
        });
        it('should handle authentication errors', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };
            MockAuthService.login.mockRejectedValue(new Error('Invalid email or password'));
            await authController_1.AuthController.login(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Invalid email or password',
                    statusCode: 401,
                },
            });
        });
    });
    describe('getProfile', () => {
        it('should successfully get user profile', async () => {
            const mockProfile = {
                id: 'user-123',
                email: 'test@example.com',
                fullName: 'Test User',
                role: models_1.UserRole.PATIENT,
                phone: '+1234567890',
                isActive: true,
                createdAt: new Date(),
            };
            mockReq.user = { id: 'user-123' };
            MockAuthService.getProfile.mockResolvedValue(mockProfile);
            await authController_1.AuthController.getProfile(mockReq, mockRes);
            expect(MockAuthService.getProfile).toHaveBeenCalledWith('user-123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockProfile,
            });
        });
        it('should return 401 if user not authenticated', async () => {
            mockReq.user = undefined;
            await authController_1.AuthController.getProfile(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Authentication required',
                    statusCode: 401,
                },
            });
        });
    });
    describe('changePassword', () => {
        it('should successfully change password', async () => {
            const passwordData = {
                currentPassword: 'oldPassword',
                newPassword: 'newPassword123',
            };
            mockReq.user = { id: 'user-123' };
            mockReq.body = passwordData;
            MockAuthService.changePassword.mockResolvedValue({ message: 'Password updated successfully' });
            await authController_1.AuthController.changePassword(mockReq, mockRes);
            expect(MockAuthService.changePassword).toHaveBeenCalledWith('user-123', 'oldPassword', 'newPassword123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password updated successfully',
            });
        });
        it('should return 400 if passwords are missing', async () => {
            mockReq.user = { id: 'user-123' };
            mockReq.body = {
                currentPassword: 'oldPassword',
                // missing newPassword
            };
            await authController_1.AuthController.changePassword(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Current password and new password are required',
                    statusCode: 400,
                },
            });
        });
        it('should return 400 if new password is too short', async () => {
            mockReq.user = { id: 'user-123' };
            mockReq.body = {
                currentPassword: 'oldPassword',
                newPassword: '123', // too short
            };
            await authController_1.AuthController.changePassword(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'New password must be at least 6 characters long',
                    statusCode: 400,
                },
            });
        });
    });
    describe('deactivateUser', () => {
        it('should successfully deactivate user', async () => {
            mockReq.user = { id: 'admin-123' };
            mockReq.params = { userId: 'user-123' };
            MockAuthService.deactivateUser.mockResolvedValue({ message: 'User deactivated successfully' });
            await authController_1.AuthController.deactivateUser(mockReq, mockRes);
            expect(MockAuthService.deactivateUser).toHaveBeenCalledWith('user-123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'User deactivated successfully',
            });
        });
        it('should return 400 if userId is missing', async () => {
            mockReq.user = { id: 'admin-123' };
            mockReq.params = {};
            await authController_1.AuthController.deactivateUser(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'User ID is required',
                    statusCode: 400,
                },
            });
        });
    });
    describe('reactivateUser', () => {
        it('should successfully reactivate user', async () => {
            mockReq.user = { id: 'admin-123' };
            mockReq.params = { userId: 'user-123' };
            MockAuthService.reactivateUser.mockResolvedValue({ message: 'User reactivated successfully' });
            await authController_1.AuthController.reactivateUser(mockReq, mockRes);
            expect(MockAuthService.reactivateUser).toHaveBeenCalledWith('user-123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'User reactivated successfully',
            });
        });
    });
});
