"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'medConnect-API documentation',
            version: '1.0.0',
            description: 'Digital Prescription & Patient Records System API',
            contact: {
                name: 'MedConnect Team',
                email: 'support@medconnect.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? `https://prescripto-backend-2lb9.onrender.com/api/v1`
                    : 'http://localhost:3300/api/v1',
                description: process.env.NODE_ENV === 'production'
                    ? 'Production server (Render)'
                    : 'Development server',
            },
            {
                url: 'https://prescripto-backend-2lb9.onrender.com/api/v1',
                description: 'Production server (Render)',
            },
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization',
            },
            {
                name: 'Patients',
                description: 'Patient management and medical records',
            },
            {
                name: 'Doctors',
                description: 'Doctor management and professional profiles',
            },
            {
                name: 'Pharmacists',
                description: 'Pharmacist management and professional profiles',
            },
            {
                name: 'Pharmacy Operations',
                description: 'QR code scanning, prescription validation, and dispensing operations',
            },
            {
                name: 'QR Codes',
                description: 'QR code generation, verification, and management for prescriptions',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token for authentication',
                },
            },
        },
    },
    // Point to the YAML files in paths/ and schemas/ folders
    apis: [
        path_1.default.join(__dirname, 'paths/auth.yaml'),
        path_1.default.join(__dirname, 'paths/patients.yaml'),
        path_1.default.join(__dirname, 'paths/doctors.yaml'),
        path_1.default.join(__dirname, 'paths/pharmacists.yaml'),
        path_1.default.join(__dirname, 'paths/pharmacy.yaml'),
        path_1.default.join(__dirname, 'paths/qrCodes.yaml'),
        path_1.default.join(__dirname, 'schemas/auth.yaml'),
        path_1.default.join(__dirname, 'schemas/patients.yaml'),
        path_1.default.join(__dirname, 'schemas/doctors.yaml'),
        path_1.default.join(__dirname, 'schemas/pharmacists.yaml'),
        path_1.default.join(__dirname, 'schemas/pharmacy.yaml'),
        path_1.default.join(__dirname, 'schemas/qrCodes.yaml'),
        path_1.default.join(__dirname, 'schemas/common.yaml'),
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
