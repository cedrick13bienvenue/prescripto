"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routers = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const patients_1 = __importDefault(require("./patients"));
const doctors_1 = __importDefault(require("./doctors"));
const pharmacists_1 = __importDefault(require("./pharmacists"));
const pharmacy_1 = __importDefault(require("./pharmacy"));
const qrCodes_1 = __importDefault(require("./qrCodes"));
const routers = (0, express_1.Router)();
exports.routers = routers;
const allRoutes = [auth_1.default, patients_1.default, doctors_1.default, pharmacists_1.default, pharmacy_1.default, qrCodes_1.default];
routers.use('/', ...allRoutes);
