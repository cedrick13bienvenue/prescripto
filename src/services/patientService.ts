import { Patient, User, MedicalVisit, Prescription, PrescriptionItem, UserRole } from '../models';
import Doctor from '../models/Doctor';
import { VisitType } from '../models/MedicalVisit';
import { PrescriptionStatus } from '../models/Prescription';
import { QRCodeService } from './qrCodeService';
import { EmailService } from './emailService';
import { 
  PatientRegistrationData, 
  PatientProfile, 
  MedicalVisitData, 
  PrescriptionData, 
  PrescriptionItemData,
  MedicalHistory,
  MedicalVisitSummary,
  PrescriptionSummary,
  PrescriptionItemSummary,
  PatientListResponse
} from '../types';

export class PatientService {

  // Get all patients with pagination (doctor-only)
static async getAllPatients (limit: number = 10, offset: number = 0): Promise<{ patients: PatientProfile[], total: number }> {
  const { count, rows: patients } = await Patient.findAndCountAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['phone', 'isActive'],
        where: { isActive: true },
      },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  const patientProfiles = patients.map(patient => {
    const userData = (patient as any).user;
    return {
      id: patient.id,
      referenceNumber: patient.referenceNumber,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      insuranceProvider: patient.insuranceProvider,
      insuranceNumber: patient.insuranceNumber,
      allergies: patient.allergies,
      existingConditions: patient.existingConditions,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      phone: userData?.phone,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    } as PatientProfile;
  });

  return {
    patients: patientProfiles,
    total: count,
  };
}

  // Patient registration with reference number generation
  static async registerPatient (data: PatientRegistrationData): Promise<PatientProfile> {
    try {
      // Hash password before creating user
      const tempUser = new User();
      const hashedPassword = await tempUser.hashPassword(data.password);

      // Create user account first
      const user = await User.create({
        email: data.email,
        passwordHash: hashedPassword,
        fullName: data.fullName,
        role: UserRole.PATIENT,
        phone: data.phone,
        isActive: true,
      });

      // Generate reference number manually to ensure it's created
      const referenceNumber = Patient.generateReferenceNumber();

      // Create patient profile with explicit reference number
      const patient = await Patient.create({
        userId: user.id,
        referenceNumber: referenceNumber,
        fullName: data.fullName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        insuranceProvider: data.insuranceProvider,
        insuranceNumber: data.insuranceNumber,
        allergies: data.allergies || [],
        existingConditions: data.existingConditions || [],
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
      });

      // Verify the patient was created successfully
      if (!patient.referenceNumber) {
        throw new Error('Failed to generate patient reference number');
      }

      return {
        id: patient.id,
        referenceNumber: patient.referenceNumber,
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        insuranceProvider: patient.insuranceProvider,
        insuranceNumber: patient.insuranceNumber,
        allergies: patient.allergies,
        existingConditions: patient.existingConditions,
        emergencyContact: patient.emergencyContact,
        emergencyPhone: patient.emergencyPhone,
        phone: data.phone,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      };
    } catch (error: any) {
      console.error('Error in registerPatient:', error);
      
      // Handle specific Sequelize errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        if (error.errors && error.errors[0] && error.errors[0].path === 'email') {
          throw new Error('Email already exists. Please use a different email address.');
        }
        throw new Error('A record with this information already exists.');
      }
      
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map((err: any) => err.message).join(', ');
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      
      throw new Error(`Patient registration failed: ${error.message}`);
    }
  }

  // Get patient by reference number (cross-hospital lookup)
  static async getPatientByReference (referenceNumber: string): Promise<PatientProfile | null> {
    const patient = await Patient.findOne({
      where: { referenceNumber },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['phone', 'isActive'],
        },
      ],
    });

    if (!patient) {
      return null;
    }

    // Access the included user data using type assertion
    const userData = (patient as any).user;
    if (!userData || !userData.isActive) {
      return null;
    }

    return {
      id: patient.id,
      referenceNumber: patient.referenceNumber,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      insuranceProvider: patient.insuranceProvider,
      insuranceNumber: patient.insuranceNumber,
      allergies: patient.allergies,
      existingConditions: patient.existingConditions,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      phone: userData.phone,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  // Get patient by ID
  static async getPatientById (patientId: string): Promise<PatientProfile | null> {
    const patient = await Patient.findByPk(patientId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['phone', 'isActive'],
        },
      ],
    });

    if (!patient) {
      return null;
    }

    // Access the included user data using type assertion
    const userData = (patient as any).user;
    if (!userData || !userData.isActive) {
      return null;
    }

    return {
      id: patient.id,
      referenceNumber: patient.referenceNumber,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      insuranceProvider: patient.insuranceProvider,
      insuranceNumber: patient.insuranceNumber,
      allergies: patient.allergies,
      existingConditions: patient.existingConditions,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      phone: userData.phone,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  // Update patient profile
  static async updatePatient (patientId: string, updateData: Partial<PatientProfile>): Promise<PatientProfile> {
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Filter out fields that shouldn't be updated directly
    const { phone, ...patientUpdateData } = updateData;

    // Update patient data
    await patient.update(patientUpdateData);

    // Update user data if needed
    if (phone) {
      await User.update(
        { phone },
        { where: { id: patient.userId } },
      );
    }

    return this.getPatientById(patientId) as Promise<PatientProfile>;
  }

  // Create medical visit
  static async createMedicalVisit (data: MedicalVisitData): Promise<MedicalVisit> {
    // Verify patient exists
    const patient = await Patient.findByPk(data.patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Verify doctor exists - handle both doctor ID and user ID
    let doctor = await Doctor.findByPk(data.doctorId, {
      include: [{
        association: 'user',
        attributes: ['email', 'fullName', 'phone']
      }]
    });
    
    // If not found by doctor ID, try to find by user ID
    if (!doctor) {
      doctor = await Doctor.findOne({
        where: { userId: data.doctorId },
        include: [{
          association: 'user',
          attributes: ['email', 'fullName', 'phone']
        }]
      });
    }
    
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const visit = await MedicalVisit.create({
      patientId: data.patientId,
      doctorId: doctor.id, // Use the actual doctor ID, not the input
      visitDate: data.visitDate,
      visitType: data.visitType,
      chiefComplaint: data.chiefComplaint,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      treatmentNotes: data.treatmentNotes,
      recommendations: data.recommendations,
    });

    return visit;
  }

  // Get patient medical history with pagination
  static async getPatientMedicalHistory (patientId: string, page: number = 1, limit: number = 10, type: 'visits' | 'prescriptions' | 'all' = 'all', sortBy: string = 'createdAt', sortOrder: 'ASC' | 'DESC' = 'DESC'): Promise<{ visits?: any[], prescriptions?: any[], total: number, pagination: any }> {
    const offset = (page - 1) * limit;
    let visits: any[] = [];
    let prescriptions: any[] = [];
    let total = 0;

    if (type === 'visits' || type === 'all') {
      const visitsResult = await MedicalVisit.findAndCountAll({
      where: { patientId },
      include: [
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['fullName', 'email']
          }]
        },
      ],
        order: [[sortBy === 'visitDate' ? 'visitDate' : 'createdAt', sortOrder]],
        limit: type === 'visits' ? limit : undefined,
        offset: type === 'visits' ? offset : undefined,
      });

      visits = visitsResult.rows.map(visit => ({
        id: visit.id,
        visitDate: visit.visitDate,
        visitType: visit.visitType,
        chiefComplaint: visit.chiefComplaint,
        symptoms: visit.symptoms,
        diagnosis: visit.diagnosis,
        treatmentNotes: visit.treatmentNotes,
        recommendations: visit.recommendations,
        doctor: (visit as any).doctor,
        createdAt: visit.createdAt,
      }));

      if (type === 'visits') {
        total = visitsResult.count;
      }
    }

    if (type === 'prescriptions' || type === 'all') {
      const prescriptionsResult = await Prescription.findAndCountAll({
      where: { patientId },
      include: [
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['fullName', 'email']
          }]
        },
        {
          model: PrescriptionItem,
          as: 'items',
        },
      ],
        order: [[sortBy === 'prescriptionNumber' ? 'prescriptionNumber' : 'createdAt', sortOrder]],
        limit: type === 'prescriptions' ? limit : undefined,
        offset: type === 'prescriptions' ? offset : undefined,
      });

      prescriptions = prescriptionsResult.rows.map(prescription => ({
        id: prescription.id,
        prescriptionNumber: prescription.prescriptionNumber,
        diagnosis: prescription.diagnosis,
        doctorNotes: prescription.doctorNotes,
        status: prescription.status,
        items: (prescription as any).items,
        doctor: (prescription as any).doctor,
        createdAt: prescription.createdAt,
      }));

      if (type === 'prescriptions') {
        total = prescriptionsResult.count;
      }
    }

    if (type === 'all') {
      // For 'all' type, we need to get the total count of both visits and prescriptions
      const [visitsCount, prescriptionsCount] = await Promise.all([
        MedicalVisit.count({ where: { patientId } }),
        Prescription.count({ where: { patientId } })
      ]);
      total = visitsCount + prescriptionsCount;
    }

    return {
      visits: type === 'visits' || type === 'all' ? visits : undefined,
      prescriptions: type === 'prescriptions' || type === 'all' ? prescriptions : undefined,
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  // Create prescription
  static async createPrescription (data: PrescriptionData): Promise<Prescription> {
    // Verify patient exists
    const patient = await Patient.findByPk(data.patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Verify doctor exists - handle both doctor ID and user ID
    let doctor = await Doctor.findByPk(data.doctorId, {
      include: [{
        association: 'user',
        attributes: ['email', 'fullName', 'phone']
      }]
    });
    
    // If not found by doctor ID, try to find by user ID
    if (!doctor) {
      doctor = await Doctor.findOne({
        where: { userId: data.doctorId },
        include: [{
          association: 'user',
          attributes: ['email', 'fullName', 'phone']
        }]
      });
    }
    
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Verify visit exists
    const visit = await MedicalVisit.findByPk(data.visitId);
    if (!visit) {
      throw new Error('Medical visit not found');
    }

    // Create prescription
    const prescription = await Prescription.create({
      prescriptionNumber: Prescription.generatePrescriptionNumber(), // Explicitly generate prescription number
      patientId: data.patientId,
      doctorId: doctor.id, // Use the actual doctor ID, not the input
      visitId: data.visitId,
      diagnosis: data.diagnosis,
      doctorNotes: data.doctorNotes,
      status: PrescriptionStatus.PENDING,
      qrCodeHash: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Temporary placeholder
    });

    // Create prescription items
    for (const itemData of data.items) {
      await PrescriptionItem.create({
        prescriptionId: prescription.id,
        medicineName: itemData.medicineName,
        dosage: itemData.dosage,
        frequency: itemData.frequency,
        quantity: itemData.quantity,
        instructions: itemData.instructions || '',
      });
    }

    // Generate QR code for the prescription
    try {
      const qrResult = await QRCodeService.generateQRCode(prescription.id);
      
      // Update prescription with QR code hash
      await prescription.update({
        qrCodeHash: qrResult.qrHash
      });

      // Send email to patient with QR code
      try {
        const patientWithUser = await Patient.findByPk(data.patientId, {
          include: [{ association: 'user' }]
        });

        if (patientWithUser && (patientWithUser as any).user) {
          const emailData = {
            patientName: (patientWithUser as any).user.fullName,
            patientEmail: (patientWithUser as any).user.email,
            prescriptionNumber: prescription.prescriptionNumber || '',
            doctorName: (doctor as any).user.fullName,
            diagnosis: prescription.diagnosis,
            medicines: data.items.map(item => ({
              name: item.medicineName,
              dosage: item.dosage,
              frequency: item.frequency,
              quantity: item.quantity,
              instructions: item.instructions
            })),
            qrCodeImage: qrResult.qrCodeImage,
            qrHash: qrResult.qrHash,
            expiresAt: qrResult.expiresAt.toISOString()
          };

          await EmailService.sendPrescriptionEmail(emailData);
          console.log(`✅ Prescription email sent to ${(patientWithUser as any).user.email}`);
        }
      } catch (emailError) {
        console.error('❌ Failed to send prescription email:', emailError);
        // Don't throw error - prescription is still created successfully
      }
    } catch (qrError) {
      console.error('❌ Failed to generate QR code:', qrError);
      // Don't throw error - prescription is still created successfully
    }

    return prescription;
  }

  // Get patient prescriptions with pagination
  static async getPatientPrescriptions (patientId: string, page: number = 1, limit: number = 10, sortBy: string = 'createdAt', sortOrder: 'ASC' | 'DESC' = 'DESC'): Promise<{ prescriptions: any[], total: number }> {
    const offset = (page - 1) * limit;
    
    const { count, rows: prescriptions } = await Prescription.findAndCountAll({
      where: { patientId },
      include: [
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['fullName', 'email']
          }]
        },
        {
          model: PrescriptionItem,
          as: 'items',
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    const prescriptionData = prescriptions.map(prescription => ({
      id: prescription.id,
      prescriptionNumber: prescription.prescriptionNumber,
      diagnosis: prescription.diagnosis,
      doctorNotes: prescription.doctorNotes,
      status: prescription.status,
      items: (prescription as any).items,
      doctor: (prescription as any).doctor,
      createdAt: prescription.createdAt,
    }));

    return {
      prescriptions: prescriptionData,
      total: count,
    };
  }

  // Search patients by name or reference number
  static async searchPatients (query: string): Promise<PatientProfile[]> {
    const { Op } = require('sequelize');

    const patients = await Patient.findAll({
      where: {
        [Op.or]: [
          { fullName: { [Op.iLike]: `%${query}%` } },
          { referenceNumber: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['phone', 'isActive'],
        },
      ],
      limit: 20,
    });

    return patients
      .filter(patient => (patient as any).user.isActive)
      .map(patient => ({
        id: patient.id,
        referenceNumber: patient.referenceNumber,
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        insuranceProvider: patient.insuranceProvider,
        insuranceNumber: patient.insuranceNumber,
        allergies: patient.allergies,
        existingConditions: patient.existingConditions,
        emergencyContact: patient.emergencyContact,
        emergencyPhone: patient.emergencyPhone,
        phone: (patient as any).user.phone,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      }));
  }

  // Get patient by user ID
  static async getPatientByUserId (userId: string): Promise<PatientProfile | null> {
    const patient = await Patient.findOne({
      where: { userId },
      include: [{
        association: 'user',
        attributes: ['email', 'phone']
      }]
    });

    if (!patient) {
      return null;
    }

    return {
      id: patient.id,
      referenceNumber: patient.referenceNumber,
      email: (patient as any).user?.email,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      insuranceProvider: patient.insuranceProvider,
      insuranceNumber: patient.insuranceNumber,
      allergies: patient.allergies,
      existingConditions: patient.existingConditions,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      phone: (patient as any).user?.phone,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }
}
