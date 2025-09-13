import { QRCodeService } from './qrCodeService';
import { Prescription, PrescriptionStatus, PharmacyLog, PharmacyAction, QRCode } from '../models';
import { User } from '../models';

export interface PrescriptionScanResult {
  prescription: any;
  isValid: boolean;
  message: string;
  canDispense: boolean;
}

export interface DispenseResult {
  success: boolean;
  message: string;
  prescription?: any;
}

export interface PharmacyLogEntry {
  prescriptionId: string;
  pharmacistId: string;
  action: PharmacyAction;
  notes?: string;
}

export class PharmacyService {
  /**
   * Scan QR code and validate prescription
   */
  static async scanQRCode(qrHash: string, pharmacistId: string): Promise<PrescriptionScanResult> {
    try {
      // Verify QR code
      const qrResult = await QRCodeService.verifyQRCode(qrHash);
      
      if (!qrResult.isValid || !qrResult.prescriptionData) {
        return {
          prescription: null,
          isValid: false,
          message: qrResult.error || 'Invalid QR code',
          canDispense: false
        };
      }

      const prescriptionId = qrResult.prescriptionData.prescriptionId;
      
      // Get prescription with all related data
      const prescription = await Prescription.findByPk(prescriptionId, {
        include: [
          { association: 'patient', include: [{ association: 'user' }] },
          { association: 'doctor', include: [{ association: 'user' }] },
          { association: 'items' },
          { association: 'qrCode' }
        ]
      });

      if (!prescription) {
        return {
          prescription: null,
          isValid: false,
          message: 'Prescription not found',
          canDispense: false
        };
      }

      // Check if QR code is expired
      if ((prescription as any).qrCode?.isExpired()) {
        return {
          prescription: null,
          isValid: false,
          message: 'QR code has expired',
          canDispense: false
        };
      }

      // Check if prescription is already fulfilled or cancelled
      if (prescription.status === PrescriptionStatus.FULFILLED || 
          prescription.status === PrescriptionStatus.CANCELLED) {
        return {
          prescription: null,
          isValid: false,
          message: 'Prescription is no longer valid',
          canDispense: false
        };
      }

      // Update prescription status to SCANNED if it's still PENDING
      if (prescription.status === PrescriptionStatus.PENDING) {
        await prescription.update({ status: PrescriptionStatus.SCANNED });
        
        // Log the scan action
        await this.logPharmacyAction({
          prescriptionId: prescription.id,
          pharmacistId,
          action: PharmacyAction.SCANNED,
          notes: 'QR code scanned by pharmacist'
        });
      }

      // Check if prescription can be dispensed
      const canDispense = prescription.status === PrescriptionStatus.SCANNED || 
                          prescription.status === PrescriptionStatus.VALIDATED;

      return {
        prescription: {
          id: prescription.id,
          prescriptionNumber: prescription.prescriptionNumber,
          patientName: (prescription as any).patient?.user?.fullName || '',
          doctorName: (prescription as any).doctor?.user?.fullName || '',
          diagnosis: prescription.diagnosis,
          doctorNotes: prescription.doctorNotes,
          status: prescription.status,
          items: (prescription as any).items || [],
          createdAt: prescription.createdAt,
          qrCode: {
            qrHash: (prescription as any).qrCode?.qrHash,
            isUsed: (prescription as any).qrCode?.isUsed,
            scanCount: (prescription as any).qrCode?.scanCount,
            expiresAt: (prescription as any).qrCode?.expiresAt
          }
        },
        isValid: true,
        message: 'Prescription validated successfully',
        canDispense
      };
    } catch (error: any) {
      console.error('Error scanning QR code:', error);
      return {
        prescription: null,
        isValid: false,
        message: error.message || 'Failed to scan QR code',
        canDispense: false
      };
    }
  }

  /**
   * Validate prescription (pharmacist reviews and approves)
   */
  static async validatePrescription(prescriptionId: string, pharmacistId: string, notes?: string): Promise<DispenseResult> {
    try {
      const prescription = await Prescription.findByPk(prescriptionId, {
        include: [
          { association: 'patient', include: [{ association: 'user' }] },
          { association: 'doctor', include: [{ association: 'user' }] },
          { association: 'items' }
        ]
      });

      if (!prescription) {
        return {
          success: false,
          message: 'Prescription not found'
        };
      }

      // Check if prescription can be validated
      if (prescription.status !== PrescriptionStatus.SCANNED) {
        return {
          success: false,
          message: 'Prescription must be scanned before validation'
        };
      }

      // Update prescription status
      await prescription.update({ status: PrescriptionStatus.VALIDATED });

      // Log the validation action
      await this.logPharmacyAction({
        prescriptionId: prescription.id,
        pharmacistId,
        action: PharmacyAction.VALIDATED,
        notes: notes || 'Prescription validated by pharmacist'
      });

      return {
        success: true,
        message: 'Prescription validated successfully',
        prescription: {
          id: prescription.id,
          prescriptionNumber: prescription.prescriptionNumber,
          status: prescription.status,
          patientName: (prescription as any).patient?.user?.fullName || '',
          doctorName: (prescription as any).doctor?.user?.fullName || ''
        }
      };
    } catch (error: any) {
      console.error('Error validating prescription:', error);
      return {
        success: false,
        message: error.message || 'Failed to validate prescription'
      };
    }
  }

  /**
   * Dispense prescription (pharmacist gives medicine to patient)
   */
  static async dispensePrescription(
    prescriptionId: string, 
    pharmacistId: string, 
    dispensingData?: {
      notes?: string;
      dispensingItems?: Array<{
        prescriptionItemId: string;
        dispensedQuantity: number;
        unitPrice: number;
        batchNumber: string;
        expiryDate: Date;
      }>;
      insuranceProvider?: string;
      insuranceNumber?: string;
    }
  ): Promise<DispenseResult> {
    try {
      const prescription = await Prescription.findByPk(prescriptionId, {
        include: [
          { association: 'patient', include: [{ association: 'user' }] },
          { association: 'doctor', include: [{ association: 'user' }] },
          { association: 'items' }
        ]
      });

      if (!prescription) {
        return {
          success: false,
          message: 'Prescription not found'
        };
      }

      // Check if prescription can be dispensed
      if (prescription.status !== PrescriptionStatus.VALIDATED) {
        return {
          success: false,
          message: 'Prescription must be validated before dispensing'
        };
      }

      // Process dispensing items if provided
      let totalAmount = 0;
      let insuranceCoverage = 0;
      let patientPayment = 0;

      if (dispensingData?.dispensingItems) {
        for (const item of dispensingData.dispensingItems) {
          const prescriptionItem = (prescription as any).items.find((pi: any) => pi.id === item.prescriptionItemId);
          if (prescriptionItem) {
            // Update prescription item with dispensing details
            await prescriptionItem.update({
              dispensedQuantity: item.dispensedQuantity,
              unitPrice: item.unitPrice,
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate,
              isDispensed: true
            });

            totalAmount += item.dispensedQuantity * item.unitPrice;
          }
        }

        // Calculate insurance coverage if provided
        if (dispensingData.insuranceProvider && dispensingData.insuranceNumber) {
          const patient = (prescription as any).patient;
          if (patient.insuranceProvider === dispensingData.insuranceProvider && 
              patient.insuranceNumber === dispensingData.insuranceNumber) {
            // Simulate insurance coverage calculation
            const coveragePercentage = this.getInsuranceCoveragePercentage(dispensingData.insuranceProvider);
            insuranceCoverage = totalAmount * (coveragePercentage / 100);
            patientPayment = totalAmount - insuranceCoverage;
          } else {
            patientPayment = totalAmount;
          }
        } else {
          patientPayment = totalAmount;
        }
      }

      // Update prescription status
      await prescription.update({ status: PrescriptionStatus.DISPENSED });

      // Mark QR code as used
      const qrCode = await (prescription as any).getQrCode();
      if (qrCode) {
        qrCode.markAsUsed();
        await qrCode.save();
      }

      // Log the dispensing action with detailed information
      await this.logPharmacyAction({
        prescriptionId: prescription.id,
        pharmacistId,
        action: PharmacyAction.DISPENSED,
        notes: dispensingData?.notes || 'Prescription dispensed to patient',
        totalAmount,
        insuranceCoverage,
        patientPayment,
        insuranceProvider: dispensingData?.insuranceProvider,
        insuranceNumber: dispensingData?.insuranceNumber,
        insuranceApprovalCode: insuranceCoverage > 0 ? this.generateApprovalCode() : undefined
      });

      // Log fulfillment action
      await this.logPharmacyAction({
        prescriptionId: prescription.id,
        pharmacistId,
        action: PharmacyAction.FULFILLED,
        notes: 'Prescription completely fulfilled'
      });

      return {
        success: true,
        message: 'Prescription dispensed successfully',
        prescription: {
          id: prescription.id,
          prescriptionNumber: prescription.prescriptionNumber,
          status: prescription.status,
          patientName: (prescription as any).patient?.user?.fullName || '',
          doctorName: (prescription as any).doctor?.user?.fullName || '',
          totalAmount,
          insuranceCoverage,
          patientPayment
        }
      };
    } catch (error: any) {
      console.error('Error dispensing prescription:', error);
      return {
        success: false,
        message: error.message || 'Failed to dispense prescription'
      };
    }
  }

  /**
   * Reject prescription (pharmacist rejects due to issues)
   */
  static async rejectPrescription(prescriptionId: string, pharmacistId: string, reason: string): Promise<DispenseResult> {
    try {
      const prescription = await Prescription.findByPk(prescriptionId, {
        include: [
          { association: 'patient', include: [{ association: 'user' }] },
          { association: 'doctor', include: [{ association: 'user' }] },
          { association: 'items' }
        ]
      });

      if (!prescription) {
        return {
          success: false,
          message: 'Prescription not found'
        };
      }

      // Check if prescription can be rejected
      if (prescription.status === PrescriptionStatus.FULFILLED || 
          prescription.status === PrescriptionStatus.CANCELLED) {
        return {
          success: false,
          message: 'Prescription cannot be rejected in current status'
        };
      }

      // Update prescription status
      await prescription.update({ status: PrescriptionStatus.REJECTED });

      // Log the rejection action
      await this.logPharmacyAction({
        prescriptionId: prescription.id,
        pharmacistId,
        action: PharmacyAction.SCANNED, // Using SCANNED as the closest action for rejection
        notes: `Prescription rejected: ${reason}`
      });

      return {
        success: true,
        message: 'Prescription rejected successfully',
        prescription: {
          id: prescription.id,
          prescriptionNumber: prescription.prescriptionNumber,
          status: prescription.status,
          patientName: (prescription as any).patient?.user?.fullName || '',
          doctorName: (prescription as any).doctor?.user?.fullName || ''
        }
      };
    } catch (error: any) {
      console.error('Error rejecting prescription:', error);
      return {
        success: false,
        message: error.message || 'Failed to reject prescription'
      };
    }
  }

  /**
   * Get pharmacy logs for a prescription
   */
  static async getPrescriptionLogs(prescriptionId: string) {
    try {
      const logs = await PharmacyLog.findAll({
        where: { prescriptionId },
        include: [
          {
            model: User,
            as: 'pharmacist',
            attributes: ['id', 'fullName', 'email']
          }
        ],
        order: [['actionTimestamp', 'DESC']]
      });

      return logs.map(log => ({
        id: log.id,
        action: log.action,
        notes: log.notes,
        pharmacistName: (log as any).pharmacist?.fullName || 'Unknown',
        timestamp: log.actionTimestamp
      }));
    } catch (error: any) {
      console.error('Error fetching prescription logs:', error);
      throw error;
    }
  }

  /**
   * Get pharmacist's dispensing history
   */
  static async getPharmacistHistory(pharmacistId: string, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await PharmacyLog.findAndCountAll({
        where: { pharmacistId },
        include: [
          {
            model: Prescription,
            as: 'prescription',
            include: [
              { association: 'patient', include: [{ association: 'user' }] },
              { association: 'doctor', include: [{ association: 'user' }] }
            ]
          }
        ],
        limit,
        offset,
        order: [['actionTimestamp', 'DESC']]
      });

      const totalPages = Math.ceil(count / limit);

      return {
        logs: rows.map(log => ({
          id: log.id,
          action: log.action,
          notes: log.notes,
          timestamp: log.actionTimestamp,
          prescription: {
            id: (log as any).prescription?.id,
            prescriptionNumber: (log as any).prescription?.prescriptionNumber,
            patientName: (log as any).prescription?.patient?.user?.fullName || '',
            doctorName: (log as any).prescription?.doctor?.user?.fullName || '',
            status: (log as any).prescription?.status
          }
        })),
        total: count,
        pagination: {
          page,
          limit,
          totalPages
        }
      };
    } catch (error: any) {
      console.error('Error fetching pharmacist history:', error);
      throw error;
    }
  }

  /**
   * Check QR code scan status
   */
  static async checkQRScanStatus(qrHash: string): Promise<any> {
    try {
      const qrCode = await QRCode.findOne({
        where: { qrHash },
        attributes: [
          'qrHash',
          'scanCount',
          'isUsed',
          'expiresAt',
          'updatedAt',
          'createdAt'
        ]
      });

      if (!qrCode) {
        return null;
      }

      const isScanned = qrCode.scanCount > 0;
      const isExpired = new Date() > new Date(qrCode.expiresAt);

      return {
        qrHash: qrCode.qrHash,
        isScanned,
        scanCount: qrCode.scanCount,
        lastScannedAt: isScanned ? qrCode.updatedAt : null,
        isUsed: qrCode.isUsed,
        isExpired,
        expiresAt: qrCode.expiresAt
      };
    } catch (error: any) {
      console.error('Error checking QR scan status:', error);
      throw error;
    }
  }

  /**
   * Log pharmacy action
   */
  private static async logPharmacyAction(data: PharmacyLogEntry & {
    totalAmount?: number;
    insuranceCoverage?: number;
    patientPayment?: number;
    insuranceProvider?: string;
    insuranceNumber?: string;
    insuranceApprovalCode?: string;
  }): Promise<void> {
    try {
      await PharmacyLog.create({
        prescriptionId: data.prescriptionId,
        pharmacistId: data.pharmacistId,
        action: data.action,
        notes: data.notes,
        totalAmount: data.totalAmount,
        insuranceCoverage: data.insuranceCoverage,
        patientPayment: data.patientPayment,
        insuranceProvider: data.insuranceProvider,
        insuranceNumber: data.insuranceNumber,
        insuranceApprovalCode: data.insuranceApprovalCode
      });
    } catch (error: any) {
      console.error('Error logging pharmacy action:', error);
      throw error;
    }
  }

  /**
   * Get insurance coverage percentage based on provider
   */
  private static getInsuranceCoveragePercentage(provider: string): number {
    const coverageMap: { [key: string]: number } = {
      'Blue Cross': 80,
      'Aetna': 75,
      'Cigna': 70,
      'UnitedHealth': 85,
      'Medicare': 90,
      'Medicaid': 95
    };
    
    return coverageMap[provider] || 60; // Default 60% coverage
  }

  /**
   * Generate insurance approval code
   */
  private static generateApprovalCode(): string {
    return `APP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  /**
   * Get dispensing history for a prescription
   */
  static async getDispensingHistory(prescriptionId: string) {
    try {
      return await PharmacyLog.findAll({
        where: { 
          prescriptionId,
          action: [PharmacyAction.DISPENSED, PharmacyAction.FULFILLED]
        },
        include: [
          { association: 'pharmacist' },
          { association: 'prescription', include: [
            { association: 'patient', include: [{ association: 'user' }] },
            { association: 'doctor', include: [{ association: 'user' }] }
          ]}
        ],
        order: [['actionTimestamp', 'DESC']]
      });
    } catch (error: any) {
      console.error('Error getting dispensing history:', error);
      throw error;
    }
  }

  /**
   * Get dispensing summary for a prescription
   */
  static async getDispensingSummary(prescriptionId: string) {
    try {
      // First get the prescription with items
      const prescription = await Prescription.findByPk(prescriptionId, {
        include: [
          { association: 'items' }
        ]
      });

      if (!prescription) {
        throw new Error(`Prescription with ID ${prescriptionId} not found`);
      }

      // Then get the dispensing log separately
      const dispensingLog = await PharmacyLog.findOne({
        where: { 
          prescriptionId,
          action: PharmacyAction.DISPENSED 
        },
        include: [{ association: 'pharmacist' }]
      });

      const dispensedItems = (prescription as any).items.filter((item: any) => item.isDispensed);
      const totalAmount = dispensedItems.reduce((sum: number, item: any) => 
        sum + (item.dispensedQuantity || 0) * (item.unitPrice || 0), 0
      );

      const insuranceCoverage = dispensingLog?.insuranceCoverage || 0;
      const patientPayment = dispensingLog?.patientPayment || totalAmount;

      return {
        prescriptionId,
        totalAmount,
        insuranceCoverage,
        patientPayment,
        dispensedItems: dispensedItems.map((item: any) => ({
          medicineName: item.medicineName,
          dispensedQuantity: item.dispensedQuantity,
          unitPrice: item.unitPrice,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate
        })),
        dispensingDate: dispensingLog?.actionTimestamp,
        pharmacist: (dispensingLog as any)?.pharmacist
      };
    } catch (error: any) {
      console.error('Error getting dispensing summary:', error);
      throw error;
    }
  }
}
