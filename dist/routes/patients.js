"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patientController_1 = require("../controllers/patientController");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Protected routes (authentication required)
router.post('/patients/register', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.ADMIN, models_1.UserRole.DOCTOR]), (0, validation_1.validateBody)(schemas_1.patientRegistrationSchema), patientController_1.PatientController.registerPatient);
router.get('/patients/search', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.ADMIN, models_1.UserRole.DOCTOR]), (0, validation_1.validateQuery)(schemas_1.searchQuerySchema), patientController_1.PatientController.searchPatients);
router.get('/patients/:patientId', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.ADMIN, models_1.UserRole.DOCTOR]), (0, validation_1.validateParams)(schemas_1.patientIdParamSchema), patientController_1.PatientController.getPatientById);
router.put('/patients/:patientId', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.ADMIN, models_1.UserRole.DOCTOR]), (0, validation_1.validateParams)(schemas_1.patientIdParamSchema), (0, validation_1.validateBody)(schemas_1.patientUpdateSchema), patientController_1.PatientController.updatePatient);
router.get('/patients/:patientId/history', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.DOCTOR, models_1.UserRole.ADMIN, models_1.UserRole.PATIENT]), (0, validation_1.validateParams)(schemas_1.patientIdParamSchema), (0, validation_1.validateQuery)(schemas_1.medicalHistoryPaginationSchema), patientController_1.PatientController.getPatientMedicalHistory);
// Doctor and Admin only routes
router.post('/patients/:patientId/visits', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.DOCTOR, models_1.UserRole.ADMIN]), (0, validation_1.validateParams)(schemas_1.patientIdParamSchema), (0, validation_1.validateBody)(schemas_1.medicalVisitSchema), patientController_1.PatientController.createMedicalVisit);
router.post('/patients/:patientId/prescriptions', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.DOCTOR, models_1.UserRole.ADMIN]), (0, validation_1.validateParams)(schemas_1.patientIdParamSchema), (0, validation_1.validateBody)(schemas_1.prescriptionSchema), patientController_1.PatientController.createPrescription);
router.get('/patients/:patientId/prescriptions', auth_1.authenticateToken, (0, auth_1.requireRole)([models_1.UserRole.DOCTOR, models_1.UserRole.ADMIN]), (0, validation_1.validateParams)(schemas_1.patientIdParamSchema), (0, validation_1.validateQuery)(schemas_1.advancedPaginationSchema), patientController_1.PatientController.getPatientPrescriptions);
router.get('/patients', auth_1.authenticateToken, auth_1.requireDoctor, (0, validation_1.validateQuery)(schemas_1.paginationSchema), patientController_1.PatientController.getAllPatients);
// Cross-hospital lookup (any authenticated user)
router.get('/patients/reference/:referenceNumber', auth_1.authenticateToken, (0, validation_1.validateParams)(schemas_1.referenceNumberParamSchema), patientController_1.PatientController.getPatientByReference);
exports.default = router;
