"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Public routes - login only
router.post('/auth/login', (0, validation_1.validateBody)(schemas_1.userLoginSchema), authController_1.AuthController.login);
// Protected routes
router.get('/auth/profile', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.DOCTOR, models_1.UserRole.ADMIN]), authController_1.AuthController.getProfile);
router.put('/auth/change-password', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.DOCTOR, models_1.UserRole.ADMIN, models_1.UserRole.PATIENT, models_1.UserRole.PHARMACIST]), (0, validation_1.validateBody)(schemas_1.passwordChangeSchema), authController_1.AuthController.changePassword);
router.post('/auth/logout', auth_1.authenticateToken, authController_1.AuthController.logout);
// Admin only routes
router.put('/auth/users/:userId/deactivate', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateParams)(schemas_1.userIdParamSchema), authController_1.AuthController.deactivateUser);
router.put('/auth/users/:userId/reactivate', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateParams)(schemas_1.userIdParamSchema), authController_1.AuthController.reactivateUser);
exports.default = router;
