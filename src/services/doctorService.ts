import Doctor from '../models/Doctor';
import { User } from '../models';
import { DoctorProfile, DoctorCreationData, DoctorUpdateData, DoctorListResponse, DoctorDetailResponse, DoctorRegistrationResponse, DoctorUpdateResponse } from '../types';

export class DoctorService {
  // Create doctor profile
  static async createDoctorProfile(data: DoctorCreationData): Promise<DoctorProfile> {
    try {
      const doctor = await Doctor.create({
        userId: data.userId,
        licenseNumber: data.licenseNumber,
        specialization: data.specialization,
        hospitalName: data.hospitalName,
        isVerified: true, // Auto-verify when created by admin
      });

      // Return the created doctor with user info
      return await this.getDoctorById(doctor.id) as DoctorProfile;
    } catch (error) {
      console.error('Error creating doctor profile:', error);
      throw error;
    }
  }

  // Get doctor by ID with user information
  static async getDoctorById(doctorId: string): Promise<DoctorProfile | null> {
    try {
      const doctor = await Doctor.findByPk(doctorId, {
        include: [{
          association: 'user',
          attributes: ['email', 'fullName', 'phone']
        }]
      });

      if (!doctor) {
        return null;
      }

      return {
        id: doctor.id,
        userId: doctor.userId,
        email: doctor.email,
        fullName: doctor.fullName,
        licenseNumber: doctor.licenseNumber,
        specialization: doctor.specialization,
        hospitalName: doctor.hospitalName,
        isVerified: doctor.isVerified,
        phone: (doctor as any).user?.phone,
        createdAt: doctor.createdAt,
      };
    } catch (error) {
      console.error('Error getting doctor by ID:', error);
      throw error;
    }
  }

  // Get doctor by user ID
  static async getDoctorByUserId(userId: string): Promise<DoctorProfile | null> {
    try {
      const doctor = await Doctor.findOne({
        where: { userId },
        include: [{
          association: 'user',
          attributes: ['email', 'fullName', 'phone']
        }]
      });

      if (!doctor) {
        return null;
      }

      return {
        id: doctor.id,
        userId: doctor.userId,
        email: doctor.email,
        fullName: doctor.fullName,
        licenseNumber: doctor.licenseNumber,
        specialization: doctor.specialization,
        hospitalName: doctor.hospitalName,
        isVerified: doctor.isVerified,
        phone: (doctor as any).user?.phone,
        createdAt: doctor.createdAt,
      };
    } catch (error) {
      console.error('Error getting doctor by user ID:', error);
      throw error;
    }
  }

  // Get all doctors
  static async getAllDoctors(): Promise<DoctorProfile[]> {
    try {
      const doctors = await Doctor.findAll({
        include: [{
          association: 'user',
          attributes: ['email', 'fullName', 'phone']
        }]
      });

      return doctors.map(doctor => ({
        id: doctor.id,
        userId: doctor.userId,
        email: doctor.email,
        fullName: doctor.fullName,
        licenseNumber: doctor.licenseNumber,
        specialization: doctor.specialization,
        hospitalName: doctor.hospitalName,
        isVerified: doctor.isVerified,
        phone: (doctor as any).user?.phone,
        createdAt: doctor.createdAt,
      }));
    } catch (error) {
      console.error('Error getting all doctors:', error);
      throw error;
    }
  }

  // Update doctor profile
  static async updateDoctorProfile(doctorId: string, updateData: {
    licenseNumber?: string;
    specialization?: string;
    hospitalName?: string;
  }): Promise<DoctorProfile | null> {
    try {
      const doctor = await Doctor.findByPk(doctorId);
      if (!doctor) {
        return null;
      }

      await doctor.update(updateData);

      // Return updated doctor with user info
      return await this.getDoctorById(doctorId);
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      throw error;
    }
  }
}
