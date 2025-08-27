import { Request, Response } from 'express';
import { PatientService, PatientRegistrationData, MedicalVisitData, PrescriptionData } from '../services/patientService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../models';

export class PatientController {
  // Patient registration
  static async registerPatient(req: Request, res: Response) {
    try {
      const data: PatientRegistrationData = req.body;
      
      // Basic validation
      if (!data.email || !data.password || !data.fullName || !data.dateOfBirth || !data.gender) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Email, password, full name, date of birth, and gender are required',
            statusCode: 400
          }
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid email format',
            statusCode: 400
          }
        });
      }

      // Password strength validation
      if (data.password.length < 6) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Password must be at least 6 characters long',
            statusCode: 400
          }
        });
      }

      // Date validation
      const birthDate = new Date(data.dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid date of birth format',
            statusCode: 400
          }
        });
      }

      const patient = await PatientService.registerPatient(data);
      
      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: patient
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 400
        }
      });
    }
  }

  // Get patient by reference number (cross-hospital lookup)
  static async getPatientByReference(req: Request, res: Response) {
    try {
      const { referenceNumber } = req.params;
      
      if (!referenceNumber) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Reference number is required',
            statusCode: 400
          }
        });
      }

      const patient = await PatientService.getPatientByReference(referenceNumber);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Patient not found',
            statusCode: 404
          }
        });
      }

      res.status(200).json({
        success: true,
        data: patient
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 500
        }
      });
    }
  }

  // Get patient by ID
  static async getPatientById(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Patient ID is required',
            statusCode: 400
          }
        });
      }

      const patient = await PatientService.getPatientById(patientId);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Patient not found',
            statusCode: 404
          }
        });
      }

      res.status(200).json({
        success: true,
        data: patient
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 500
        }
      });
    }
  }

  // Update patient profile
  static async updatePatient(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const updateData = req.body;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Patient ID is required',
            statusCode: 400
          }
        });
      }

      const allowedFields = ['fullName', 'dateOfBirth', 'gender', 'insuranceProvider', 'insuranceNumber', 'allergies', 'existingConditions', 'emergencyContact', 'emergencyPhone', 'phone'];
      const filteredData: any = {};
      
      // Only allow specific fields to be updated
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No valid fields to update',
            statusCode: 400
          }
        });
      }

      const updatedPatient = await PatientService.updatePatient(patientId, filteredData);
      
      res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: updatedPatient
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 400
        }
      });
    }
  }

  // Create medical visit
  static async createMedicalVisit(req: Request, res: Response) {
    try {
      const data: MedicalVisitData = req.body;
      
      // Basic validation
      if (!data.patientId || !data.doctorId || !data.visitDate || !data.visitType || !data.chiefComplaint) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Patient ID, doctor ID, visit date, visit type, and chief complaint are required',
            statusCode: 400
          }
        });
      }

      // Date validation
      const visitDate = new Date(data.visitDate);
      if (isNaN(visitDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid visit date format',
            statusCode: 400
          }
        });
      }

      const visit = await PatientService.createMedicalVisit(data);
      
      res.status(201).json({
        success: true,
        message: 'Medical visit created successfully',
        data: visit
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 400
        }
      });
    }
  }

  // Get patient medical history
  static async getPatientMedicalHistory(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Patient ID is required',
            statusCode: 400
          }
        });
      }

      const history = await PatientService.getPatientMedicalHistory(patientId);
      
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 500
        }
      });
    }
  }

  // Create prescription
  static async createPrescription(req: Request, res: Response) {
    try {
      const data: PrescriptionData = req.body;
      
      // Basic validation
      if (!data.patientId || !data.doctorId || !data.visitId || !data.diagnosis || !data.items || data.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Patient ID, doctor ID, visit ID, diagnosis, and prescription items are required',
            statusCode: 400
          }
        });
      }

      // Validate prescription items
      for (const item of data.items) {
        if (!item.medicineName || !item.dosage || !item.frequency || !item.quantity) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Each prescription item must have medicine name, dosage, frequency, and quantity',
              statusCode: 400
            }
          });
        }
      }

      const prescription = await PatientService.createPrescription(data);
      
      res.status(201).json({
        success: true,
        message: 'Prescription created successfully',
        data: prescription
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 400
        }
      });
    }
  }

  // Get patient prescriptions
  static async getPatientPrescriptions(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Patient ID is required',
            statusCode: 400
          }
        });
      }

      const prescriptions = await PatientService.getPatientPrescriptions(patientId);
      
      res.status(200).json({
        success: true,
        data: prescriptions
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 500
        }
      });
    }
  }

  // Search patients
  static async searchPatients(req: Request, res: Response) {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Search query is required',
            statusCode: 400
          }
        });
      }

      const patients = await PatientService.searchPatients(query);
      
      res.status(200).json({
        success: true,
        data: patients
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 500
        }
      });
    }
  }
}
