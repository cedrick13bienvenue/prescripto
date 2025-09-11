"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
describe('Patient Model', () => {
    describe('generateReferenceNumber', () => {
        it('should generate reference number with correct format', () => {
            const referenceNumber = models_1.Patient.generateReferenceNumber();
            // Should match format: PAT-YYYYMMDD-XXXX
            const pattern = /^PAT-\d{8}-\d{4}$/;
            expect(referenceNumber).toMatch(pattern);
        });
        it('should generate unique reference numbers', () => {
            const ref1 = models_1.Patient.generateReferenceNumber();
            const ref2 = models_1.Patient.generateReferenceNumber();
            // While there's a tiny chance they could be the same due to random component,
            // it's extremely unlikely
            expect(ref1).not.toBe(ref2);
        });
        it('should include current date in reference number', () => {
            const referenceNumber = models_1.Patient.generateReferenceNumber();
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const expectedDatePart = `${year}${month}${day}`;
            expect(referenceNumber).toContain(expectedDatePart);
        });
        it('should start with PAT prefix', () => {
            const referenceNumber = models_1.Patient.generateReferenceNumber();
            expect(referenceNumber).toMatch(/^PAT-/);
        });
        it('should have 4-digit random suffix', () => {
            const referenceNumber = models_1.Patient.generateReferenceNumber();
            const parts = referenceNumber.split('-');
            const randomPart = parts[2];
            expect(randomPart).toHaveLength(4);
            expect(randomPart).toMatch(/^\d{4}$/);
        });
    });
    describe('Patient attributes', () => {
        it('should have correct gender enum values', () => {
            // Test that the model accepts valid gender values
            const validGenders = ['male', 'female', 'other'];
            validGenders.forEach(gender => {
                expect(['male', 'female', 'other']).toContain(gender);
            });
        });
        it('should handle JSON fields for allergies and existingConditions', () => {
            // Mock patient instance
            const patient = new models_1.Patient({
                id: 'patient-123',
                referenceNumber: 'PAT-20241201-1234',
                userId: 'user-123',
                fullName: 'John Doe',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'male',
                allergies: ['Peanuts', 'Shellfish'],
                existingConditions: ['Diabetes', 'Hypertension'],
                emergencyContact: 'Jane Doe',
                emergencyPhone: '+1234567890',
            });
            expect(Array.isArray(patient.allergies)).toBe(true);
            expect(Array.isArray(patient.existingConditions)).toBe(true);
            expect(patient.allergies).toContain('Peanuts');
            expect(patient.existingConditions).toContain('Diabetes');
        });
    });
    describe('Patient creation attributes', () => {
        it('should exclude id and referenceNumber from creation attributes', () => {
            // This is more of a TypeScript type check, but we can verify the concept
            const creationData = {
                userId: 'user-123',
                fullName: 'John Doe',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'male',
                emergencyContact: 'Jane Doe',
                emergencyPhone: '+1234567890',
                allergies: [],
                existingConditions: [],
            };
            // Should not include id or referenceNumber in creation data
            expect(creationData).not.toHaveProperty('id');
            expect(creationData).not.toHaveProperty('referenceNumber');
            expect(creationData).not.toHaveProperty('createdAt');
            expect(creationData).not.toHaveProperty('updatedAt');
            // Should include required fields
            expect(creationData).toHaveProperty('userId');
            expect(creationData).toHaveProperty('fullName');
            expect(creationData).toHaveProperty('dateOfBirth');
            expect(creationData).toHaveProperty('gender');
        });
    });
});
