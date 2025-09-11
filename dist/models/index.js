"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacyAction = exports.PrescriptionStatus = exports.VisitType = exports.UserRole = exports.TokenBlacklist = exports.PharmacyLog = exports.QRCode = exports.PrescriptionItem = exports.Prescription = exports.MedicalVisit = exports.Pharmacist = exports.Doctor = exports.Patient = exports.User = void 0;
// Import all models
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Patient_1 = __importDefault(require("./Patient"));
exports.Patient = Patient_1.default;
const Doctor_1 = __importDefault(require("./Doctor"));
exports.Doctor = Doctor_1.default;
const Pharmacist_1 = __importDefault(require("./Pharmacist"));
exports.Pharmacist = Pharmacist_1.default;
const MedicalVisit_1 = __importDefault(require("./MedicalVisit"));
exports.MedicalVisit = MedicalVisit_1.default;
const Prescription_1 = __importDefault(require("./Prescription"));
exports.Prescription = Prescription_1.default;
const PrescriptionItem_1 = __importDefault(require("./PrescriptionItem"));
exports.PrescriptionItem = PrescriptionItem_1.default;
const QRCode_1 = __importDefault(require("./QRCode"));
exports.QRCode = QRCode_1.default;
const PharmacyLog_1 = __importDefault(require("./PharmacyLog"));
exports.PharmacyLog = PharmacyLog_1.default;
const TokenBlacklist_1 = __importDefault(require("./TokenBlacklist"));
exports.TokenBlacklist = TokenBlacklist_1.default;
// Export enums and types
var User_2 = require("./User");
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return User_2.UserRole; } });
var MedicalVisit_2 = require("./MedicalVisit");
Object.defineProperty(exports, "VisitType", { enumerable: true, get: function () { return MedicalVisit_2.VisitType; } });
var Prescription_2 = require("./Prescription");
Object.defineProperty(exports, "PrescriptionStatus", { enumerable: true, get: function () { return Prescription_2.PrescriptionStatus; } });
var PharmacyLog_2 = require("./PharmacyLog");
Object.defineProperty(exports, "PharmacyAction", { enumerable: true, get: function () { return PharmacyLog_2.PharmacyAction; } });
// This file ensures all models are loaded and associations are established
exports.default = {
    User: User_1.default,
    Patient: Patient_1.default,
    Doctor: Doctor_1.default,
    Pharmacist: Pharmacist_1.default,
    MedicalVisit: MedicalVisit_1.default,
    Prescription: Prescription_1.default,
    PrescriptionItem: PrescriptionItem_1.default,
    QRCode: QRCode_1.default,
    PharmacyLog: PharmacyLog_1.default,
    TokenBlacklist: TokenBlacklist_1.default,
};
