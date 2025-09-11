"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pharmacistController_1 = require("../controllers/pharmacistController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Admin only routes for pharmacist management
router.post('/pharmacists/register', auth_1.authenticateToken, auth_1.requireAdmin, pharmacistController_1.PharmacistController.registerPharmacist);
router.get('/pharmacists', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateQuery)(schemas_1.advancedPaginationSchema), pharmacistController_1.PharmacistController.getAllPharmacists);
router.get('/pharmacists/:pharmacistId', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateParams)(schemas_1.pharmacistIdParamSchema), pharmacistController_1.PharmacistController.getPharmacistById);
router.put('/pharmacists/:pharmacistId', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateParams)(schemas_1.pharmacistIdParamSchema), pharmacistController_1.PharmacistController.updatePharmacist);
router.delete('/pharmacists/:pharmacistId', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateParams)(schemas_1.pharmacistIdParamSchema), pharmacistController_1.PharmacistController.deletePharmacist);
router.put('/pharmacists/:pharmacistId/verify', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateParams)(schemas_1.pharmacistIdParamSchema), pharmacistController_1.PharmacistController.verifyPharmacist);
router.put('/pharmacists/:pharmacistId/unverify', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateParams)(schemas_1.pharmacistIdParamSchema), pharmacistController_1.PharmacistController.unverifyPharmacist);
exports.default = router;
