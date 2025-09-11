"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const patientController_1 = require("../../controllers/patientController");
const patientService_1 = require("../../services/patientService");
const MedicalVisit_1 = require("../../models/MedicalVisit");
// Mock the PatientService
jest.mock('../../src/services/patientService');
const MockPatientService = patientService_1.PatientService;
describe('PatientController', () => {
    let mockReq;
    let mockRes;
    beforeEach(() => {
        mockReq = {
            body: {},
            params: {},
            query: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });
    describe('registerPatient', () => {
        it('should successfully register a patient', async () => {
            const patientData = {
                email: 'patient@example.com',
                password: 'password123',
                fullName: 'John Doe',
                dateOfBirth: '1990-01-01',
                gender: 'male',
                phone: '+1234567890',
                emergencyContact: 'Jane Doe',
                emergencyPhone: '+1234567891',
            };
            const mockPatient = {
                id: 'patient-123',
                referenceNumber: 'PAT-20241201-1234',
                fullName: 'John Doe',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'male',
            };
            mockReq.body = patientData;
            MockPatientService.registerPatient.mockResolvedValue(mockPatient);
            await patientController_1.PatientController.registerPatient(mockReq, mockRes);
            expect(MockPatientService.registerPatient).toHaveBeenCalledWith(patientData);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Patient registered successfully',
                data: mockPatient,
            });
        });
        it('should return 400 if required fields are missing', async () => {
            mockReq.body = {
                email: 'patient@example.com',
                // missing password, fullName, dateOfBirth, gender
            };
            await patientController_1.PatientController.registerPatient(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Email, password, full name, date of birth, and gender are required',
                    statusCode: 400,
                },
            });
        });
        it('should return 400 for invalid email format', async () => {
            mockReq.body = {
                email: 'invalid-email',
                password: 'password123',
                fullName: 'John Doe',
                dateOfBirth: '1990-01-01',
                gender: 'male',
            };
            await patientController_1.PatientController.registerPatient(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Invalid email format',
                    statusCode: 400,
                },
            });
        });
        it('should return 400 for weak password', async () => {
            mockReq.body = {
                email: 'patient@example.com',
                password: '123', // too short
                fullName: 'John Doe',
                dateOfBirth: '1990-01-01',
                gender: 'male',
            };
            await patientController_1.PatientController.registerPatient(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Password must be at least 6 characters long',
                    statusCode: 400,
                },
            });
        });
        it('should return 400 for invalid date format', async () => {
            mockReq.body = {
                email: 'patient@example.com',
                password: 'password123',
                fullName: 'John Doe',
                dateOfBirth: 'invalid-date',
                gender: 'male',
            };
            await patientController_1.PatientController.registerPatient(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Invalid date of birth format',
                    statusCode: 400,
                },
            });
        });
        it('should handle service errors', async () => {
            mockReq.body = {
                email: 'patient@example.com',
                password: 'password123',
                fullName: 'John Doe',
                dateOfBirth: '1990-01-01',
                gender: 'male',
            };
            MockPatientService.registerPatient.mockRejectedValue(new Error('Email already exists'));
            await patientController_1.PatientController.registerPatient(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Email already exists',
                    statusCode: 400,
                },
            });
        });
    });
    describe('getPatientByReference', () => {
        it('should successfully get patient by reference number', async () => {
            const mockPatient = {
                id: 'patient-123',
                referenceNumber: 'PAT-20241201-1234',
                fullName: 'John Doe',
            };
            mockReq.params = { referenceNumber: 'PAT-20241201-1234' };
            MockPatientService.getPatientByReference.mockResolvedValue(mockPatient);
            await patientController_1.PatientController.getPatientByReference(mockReq, mockRes);
            expect(MockPatientService.getPatientByReference).toHaveBeenCalledWith('PAT-20241201-1234');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockPatient,
            });
        });
        it('should return 400 if reference number is missing', async () => {
            mockReq.params = {};
            await patientController_1.PatientController.getPatientByReference(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Reference number is required',
                    statusCode: 400,
                },
            });
        });
        it('should return 404 if patient not found', async () => {
            mockReq.params = { referenceNumber: 'NON-EXISTENT' };
            MockPatientService.getPatientByReference.mockResolvedValue(null);
            await patientController_1.PatientController.getPatientByReference(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Patient not found',
                    statusCode: 404,
                },
            });
        });
    });
    describe('getPatientById', () => {
        it('should successfully get patient by ID', async () => {
            const mockPatient = {
                id: 'patient-123',
                fullName: 'John Doe',
            };
            mockReq.params = { patientId: 'patient-123' };
            MockPatientService.getPatientById.mockResolvedValue(mockPatient);
            await patientController_1.PatientController.getPatientById(mockReq, mockRes);
            expect(MockPatientService.getPatientById).toHaveBeenCalledWith('patient-123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockPatient,
            });
        });
        it('should return 400 if patient ID is missing', async () => {
            mockReq.params = {};
            await patientController_1.PatientController.getPatientById(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Patient ID is required',
                    statusCode: 400,
                },
            });
        });
        it('should return 404 if patient not found', async () => {
            mockReq.params = { patientId: 'non-existent' };
            MockPatientService.getPatientById.mockResolvedValue(null);
            await patientController_1.PatientController.getPatientById(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Patient not found',
                    statusCode: 404,
                },
            });
        });
    });
    describe('updatePatient', () => {
        it('should successfully update patient', async () => {
            const updateData = {
                fullName: 'John Updated',
                phone: '+9999999999',
            };
            const mockUpdatedPatient = {
                id: 'patient-123',
                fullName: 'John Updated',
                phone: '+9999999999',
            };
            mockReq.params = { patientId: 'patient-123' };
            mockReq.body = updateData;
            MockPatientService.updatePatient.mockResolvedValue(mockUpdatedPatient);
            await patientController_1.PatientController.updatePatient(mockReq, mockRes);
            expect(MockPatientService.updatePatient).toHaveBeenCalledWith('patient-123', updateData);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Patient updated successfully',
                data: mockUpdatedPatient,
            });
        });
        it('should return 400 if no valid fields to update', async () => {
            mockReq.params = { patientId: 'patient-123' };
            mockReq.body = {
                invalidField: 'value',
            };
            await patientController_1.PatientController.updatePatient(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'No valid fields to update',
                    statusCode: 400,
                },
            });
        });
        it('should return 400 if patient ID is missing', async () => {
            mockReq.params = {};
            mockReq.body = { fullName: 'Updated Name' };
            await patientController_1.PatientController.updatePatient(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Patient ID is required',
                    statusCode: 400,
                },
            });
        });
    });
    describe('createMedicalVisit', () => {
        it('should successfully create medical visit', async () => {
            const visitData = {
                patientId: 'patient-123',
                doctorId: 'doctor-123',
                visitDate: new Date('2024-12-01'),
                visitType: MedicalVisit_1.VisitType.CONSULTATION,
                chiefComplaint: 'Headache',
                symptoms: 'Severe headache for 2 days',
            };
            const mockVisit = {
                id: 'visit-123',
                ...visitData,
            };
            mockReq.body = visitData;
            MockPatientService.createMedicalVisit.mockResolvedValue(mockVisit);
            await patientController_1.PatientController.createMedicalVisit(mockReq, mockRes);
            expect(MockPatientService.createMedicalVisit).toHaveBeenCalledWith(visitData);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Medical visit created successfully',
                data: mockVisit,
            });
        });
        it('should return 400 if required fields are missing', async () => {
            mockReq.body = {
                patientId: 'patient-123',
                // missing doctorId, visitDate, visitType, chiefComplaint
            };
            await patientController_1.PatientController.createMedicalVisit(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Patient ID, doctor ID, visit date, visit type, and chief complaint are required',
                    statusCode: 400,
                },
            });
        });
        it('should return 400 for invalid visit date', async () => {
            mockReq.body = {
                patientId: 'patient-123',
                doctorId: 'doctor-123',
                visitDate: 'invalid-date',
                visitType: MedicalVisit_1.VisitType.CONSULTATION,
                chiefComplaint: 'Headache',
            };
            await patientController_1.PatientController.createMedicalVisit(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Invalid visit date format',
                    statusCode: 400,
                },
            });
        });
    });
    describe('getPatientMedicalHistory', () => {
        it('should successfully get patient medical history', async () => {
            const mockHistory = {
                visits: [
                    {
                        id: 'visit-123',
                        visitType: MedicalVisit_1.VisitType.CONSULTATION,
                        chiefComplaint: 'Headache',
                    },
                ],
                prescriptions: [
                    {
                        id: 'prescription-123',
                        diagnosis: 'Tension headache',
                    },
                ],
            };
            mockReq.params = { patientId: 'patient-123' };
            MockPatientService.getPatientMedicalHistory.mockResolvedValue(mockHistory);
            await patientController_1.PatientController.getPatientMedicalHistory(mockReq, mockRes);
            expect(MockPatientService.getPatientMedicalHistory).toHaveBeenCalledWith('patient-123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockHistory,
            });
        });
        it('should return 400 if patient ID is missing', async () => {
            mockReq.params = {};
            await patientController_1.PatientController.getPatientMedicalHistory(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Patient ID is required',
                    statusCode: 400,
                },
            });
        });
    });
    describe('createPrescription', () => {
        it('should successfully create prescription', async () => {
            const prescriptionData = {
                patientId: 'patient-123',
                doctorId: 'doctor-123',
                visitId: 'visit-123',
                diagnosis: 'Hypertension',
                items: [
                    {
                        medicineName: 'Lisinopril',
                        dosage: '10mg',
                        frequency: 'Once daily',
                        quantity: 30,
                        instructions: 'Take with food',
                    },
                ],
            };
            const mockPrescription = {
                id: 'prescription-123',
                ...prescriptionData,
            };
            mockReq.body = prescriptionData;
            MockPatientService.createPrescription.mockResolvedValue(mockPrescription);
            await patientController_1.PatientController.createPrescription(mockReq, mockRes);
            expect(MockPatientService.createPrescription).toHaveBeenCalledWith(prescriptionData);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Prescription created successfully',
                data: mockPrescription,
            });
        });
        it('should return 400 if required fields are missing', async () => {
            mockReq.body = {
                patientId: 'patient-123',
                // missing doctorId, visitId, diagnosis, items
            };
            await patientController_1.PatientController.createPrescription(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Patient ID, doctor ID, visit ID, diagnosis, and prescription items are required',
                    statusCode: 400,
                },
            });
        });
        it('should return 400 if prescription items are invalid', async () => {
            mockReq.body = {
                patientId: 'patient-123',
                doctorId: 'doctor-123',
                visitId: 'visit-123',
                diagnosis: 'Hypertension',
                items: [
                    {
                        medicineName: 'Lisinopril',
                        // missing dosage, frequency, quantity
                    },
                ],
            };
            await patientController_1.PatientController.createPrescription(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Each prescription item must have medicine name, dosage, frequency, and quantity',
                    statusCode: 400,
                },
            });
        });
    });
    describe('getPatientPrescriptions', () => {
        it('should successfully get patient prescriptions', async () => {
            const mockPrescriptions = [
                {
                    id: 'prescription-123',
                    diagnosis: 'Hypertension',
                    items: [
                        { medicineName: 'Lisinopril', dosage: '10mg' },
                    ],
                },
            ];
            mockReq.params = { patientId: 'patient-123' };
            MockPatientService.getPatientPrescriptions.mockResolvedValue(mockPrescriptions);
            await patientController_1.PatientController.getPatientPrescriptions(mockReq, mockRes);
            expect(MockPatientService.getPatientPrescriptions).toHaveBeenCalledWith('patient-123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockPrescriptions,
            });
        });
        it('should return 400 if patient ID is missing', async () => {
            mockReq.params = {};
            await patientController_1.PatientController.getPatientPrescriptions(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Patient ID is required',
                    statusCode: 400,
                },
            });
        });
    });
    describe('searchPatients', () => {
        it('should successfully search patients', async () => {
            const mockPatients = [
                {
                    id: 'patient-123',
                    fullName: 'John Doe',
                    referenceNumber: 'PAT-20241201-1234',
                },
            ];
            mockReq.query = { query: 'John' };
            MockPatientService.searchPatients.mockResolvedValue(mockPatients);
            await patientController_1.PatientController.searchPatients(mockReq, mockRes);
            expect(MockPatientService.searchPatients).toHaveBeenCalledWith('John');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockPatients,
            });
        });
        it('should return 400 if search query is missing', async () => {
            mockReq.query = {};
            await patientController_1.PatientController.searchPatients(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Search query is required',
                    statusCode: 400,
                },
            });
        });
        it('should return 400 if search query is not a string', async () => {
            mockReq.query = { query: ['invalid'] };
            await patientController_1.PatientController.searchPatients(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Search query is required',
                    statusCode: 400,
                },
            });
        });
    });
});
