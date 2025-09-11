"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacyService = void 0;
const qrCodeService_1 = require("./qrCodeService");
const models_1 = require("../models");
const models_2 = require("../models");
class PharmacyService {
    /**
     * Scan QR code and validate prescription
     */
    static async scanQRCode(qrHash, pharmacistId) {
        try {
            // Verify QR code
            const qrResult = await qrCodeService_1.QRCodeService.verifyQRCode(qrHash);
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
            const prescription = await models_1.Prescription.findByPk(prescriptionId, {
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
            if (prescription.qrCode?.isExpired()) {
                return {
                    prescription: null,
                    isValid: false,
                    message: 'QR code has expired',
                    canDispense: false
                };
            }
            // Check if prescription is already fulfilled or cancelled
            if (prescription.status === models_1.PrescriptionStatus.FULFILLED ||
                prescription.status === models_1.PrescriptionStatus.CANCELLED) {
                return {
                    prescription: null,
                    isValid: false,
                    message: 'Prescription is no longer valid',
                    canDispense: false
                };
            }
            // Update prescription status to SCANNED if it's still PENDING
            if (prescription.status === models_1.PrescriptionStatus.PENDING) {
                await prescription.update({ status: models_1.PrescriptionStatus.SCANNED });
                // Log the scan action
                await this.logPharmacyAction({
                    prescriptionId: prescription.id,
                    pharmacistId,
                    action: models_1.PharmacyAction.SCANNED,
                    notes: 'QR code scanned by pharmacist'
                });
            }
            // Check if prescription can be dispensed
            const canDispense = prescription.status === models_1.PrescriptionStatus.SCANNED ||
                prescription.status === models_1.PrescriptionStatus.VALIDATED;
            return {
                prescription: {
                    id: prescription.id,
                    prescriptionNumber: prescription.prescriptionNumber,
                    patientName: prescription.patient?.user?.fullName || '',
                    doctorName: prescription.doctor?.user?.fullName || '',
                    diagnosis: prescription.diagnosis,
                    doctorNotes: prescription.doctorNotes,
                    status: prescription.status,
                    items: prescription.items || [],
                    createdAt: prescription.createdAt,
                    qrCode: {
                        qrHash: prescription.qrCode?.qrHash,
                        isUsed: prescription.qrCode?.isUsed,
                        scanCount: prescription.qrCode?.scanCount,
                        expiresAt: prescription.qrCode?.expiresAt
                    }
                },
                isValid: true,
                message: 'Prescription validated successfully',
                canDispense
            };
        }
        catch (error) {
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
    static async validatePrescription(prescriptionId, pharmacistId, notes) {
        try {
            const prescription = await models_1.Prescription.findByPk(prescriptionId, {
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
            if (prescription.status !== models_1.PrescriptionStatus.SCANNED) {
                return {
                    success: false,
                    message: 'Prescription must be scanned before validation'
                };
            }
            // Update prescription status
            await prescription.update({ status: models_1.PrescriptionStatus.VALIDATED });
            // Log the validation action
            await this.logPharmacyAction({
                prescriptionId: prescription.id,
                pharmacistId,
                action: models_1.PharmacyAction.VALIDATED,
                notes: notes || 'Prescription validated by pharmacist'
            });
            return {
                success: true,
                message: 'Prescription validated successfully',
                prescription: {
                    id: prescription.id,
                    prescriptionNumber: prescription.prescriptionNumber,
                    status: prescription.status,
                    patientName: prescription.patient?.user?.fullName || '',
                    doctorName: prescription.doctor?.user?.fullName || ''
                }
            };
        }
        catch (error) {
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
    static async dispensePrescription(prescriptionId, pharmacistId, notes) {
        try {
            const prescription = await models_1.Prescription.findByPk(prescriptionId, {
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
            if (prescription.status !== models_1.PrescriptionStatus.VALIDATED) {
                return {
                    success: false,
                    message: 'Prescription must be validated before dispensing'
                };
            }
            // Update prescription status
            await prescription.update({ status: models_1.PrescriptionStatus.DISPENSED });
            // Mark QR code as used
            const qrCode = await prescription.getQrCode();
            if (qrCode) {
                qrCode.markAsUsed();
                await qrCode.save();
            }
            // Log the dispensing action
            await this.logPharmacyAction({
                prescriptionId: prescription.id,
                pharmacistId,
                action: models_1.PharmacyAction.FULFILLED,
                notes: notes || 'Prescription dispensed to patient'
            });
            return {
                success: true,
                message: 'Prescription dispensed successfully',
                prescription: {
                    id: prescription.id,
                    prescriptionNumber: prescription.prescriptionNumber,
                    status: prescription.status,
                    patientName: prescription.patient?.user?.fullName || '',
                    doctorName: prescription.doctor?.user?.fullName || ''
                }
            };
        }
        catch (error) {
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
    static async rejectPrescription(prescriptionId, pharmacistId, reason) {
        try {
            const prescription = await models_1.Prescription.findByPk(prescriptionId, {
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
            if (prescription.status === models_1.PrescriptionStatus.FULFILLED ||
                prescription.status === models_1.PrescriptionStatus.CANCELLED) {
                return {
                    success: false,
                    message: 'Prescription cannot be rejected in current status'
                };
            }
            // Update prescription status
            await prescription.update({ status: models_1.PrescriptionStatus.REJECTED });
            // Log the rejection action
            await this.logPharmacyAction({
                prescriptionId: prescription.id,
                pharmacistId,
                action: models_1.PharmacyAction.SCANNED, // Using SCANNED as the closest action for rejection
                notes: `Prescription rejected: ${reason}`
            });
            return {
                success: true,
                message: 'Prescription rejected successfully',
                prescription: {
                    id: prescription.id,
                    prescriptionNumber: prescription.prescriptionNumber,
                    status: prescription.status,
                    patientName: prescription.patient?.user?.fullName || '',
                    doctorName: prescription.doctor?.user?.fullName || ''
                }
            };
        }
        catch (error) {
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
    static async getPrescriptionLogs(prescriptionId) {
        try {
            const logs = await models_1.PharmacyLog.findAll({
                where: { prescriptionId },
                include: [
                    {
                        model: models_2.User,
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
                pharmacistName: log.pharmacist?.fullName || 'Unknown',
                timestamp: log.actionTimestamp
            }));
        }
        catch (error) {
            console.error('Error fetching prescription logs:', error);
            throw error;
        }
    }
    /**
     * Get pharmacist's dispensing history
     */
    static async getPharmacistHistory(pharmacistId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await models_1.PharmacyLog.findAndCountAll({
                where: { pharmacistId },
                include: [
                    {
                        model: models_1.Prescription,
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
                        id: log.prescription?.id,
                        prescriptionNumber: log.prescription?.prescriptionNumber,
                        patientName: log.prescription?.patient?.user?.fullName || '',
                        doctorName: log.prescription?.doctor?.user?.fullName || '',
                        status: log.prescription?.status
                    }
                })),
                total: count,
                pagination: {
                    page,
                    limit,
                    totalPages
                }
            };
        }
        catch (error) {
            console.error('Error fetching pharmacist history:', error);
            throw error;
        }
    }
    /**
     * Check QR code scan status
     */
    static async checkQRScanStatus(qrHash) {
        try {
            const qrCode = await models_1.QRCode.findOne({
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
        }
        catch (error) {
            console.error('Error checking QR scan status:', error);
            throw error;
        }
    }
    /**
     * Log pharmacy action
     */
    static async logPharmacyAction(data) {
        try {
            await models_1.PharmacyLog.create({
                prescriptionId: data.prescriptionId,
                pharmacistId: data.pharmacistId,
                action: data.action,
                notes: data.notes
            });
        }
        catch (error) {
            console.error('Error logging pharmacy action:', error);
            throw error;
        }
    }
}
exports.PharmacyService = PharmacyService;
