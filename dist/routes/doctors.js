"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctorController_1 = require("../controllers/doctorController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Admin only routes for doctor management
router.post('/doctors/register', auth_1.authenticateToken, auth_1.requireAdmin, doctorController_1.DoctorController.registerDoctor);
router.get('/doctors', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateQuery)(schemas_1.advancedPaginationSchema), doctorController_1.DoctorController.getAllDoctors);
router.get('/doctors/:doctorId', auth_1.authenticateToken, auth_1.requireAdmin, doctorController_1.DoctorController.getDoctorById);
router.put('/doctors/:doctorId', auth_1.authenticateToken, auth_1.requireAdmin, doctorController_1.DoctorController.updateDoctorProfile);
router.delete('/doctors/:doctorId', auth_1.authenticateToken, auth_1.requireAdmin, doctorController_1.DoctorController.deleteDoctor);
exports.default = router;
