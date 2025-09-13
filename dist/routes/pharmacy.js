"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pharmacyController_1 = require("../controllers/pharmacyController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Pharmacist only routes for pharmacy operations
router.post('/pharmacy/scan', auth_1.authenticateToken, auth_1.requirePharmacist, pharmacyController_1.PharmacyController.scanQRCode);
router.post('/pharmacy/validate/:prescriptionId', auth_1.authenticateToken, auth_1.requirePharmacist, (0, validation_1.validateParams)(schemas_1.prescriptionIdParamSchema), pharmacyController_1.PharmacyController.validatePrescription);
router.post('/pharmacy/dispense/:prescriptionId', auth_1.authenticateToken, auth_1.requirePharmacist, (0, validation_1.validateParams)(schemas_1.prescriptionIdParamSchema), pharmacyController_1.PharmacyController.dispensePrescription);
router.post('/pharmacy/reject/:prescriptionId', auth_1.authenticateToken, auth_1.requirePharmacist, (0, validation_1.validateParams)(schemas_1.prescriptionIdParamSchema), pharmacyController_1.PharmacyController.rejectPrescription);
router.get('/pharmacy/logs/:prescriptionId', auth_1.authenticateToken, auth_1.requirePharmacist, (0, validation_1.validateParams)(schemas_1.prescriptionIdParamSchema), pharmacyController_1.PharmacyController.getPrescriptionLogs);
router.get('/pharmacy/history', auth_1.authenticateToken, auth_1.requirePharmacist, pharmacyController_1.PharmacyController.getPharmacistHistory);
router.get('/pharmacy/scan-status/:qrHash', auth_1.authenticateToken, auth_1.requirePharmacist, pharmacyController_1.PharmacyController.checkScanStatus);
// Enhanced dispensing routes
router.get('/pharmacy/dispensing-history/:prescriptionId', auth_1.authenticateToken, auth_1.requirePharmacist, (0, validation_1.validateParams)(schemas_1.prescriptionIdParamSchema), pharmacyController_1.PharmacyController.getDispensingHistory);
router.get('/pharmacy/dispensing-summary/:prescriptionId', auth_1.authenticateToken, auth_1.requirePharmacist, (0, validation_1.validateParams)(schemas_1.prescriptionIdParamSchema), pharmacyController_1.PharmacyController.getDispensingSummary);
exports.default = router;
