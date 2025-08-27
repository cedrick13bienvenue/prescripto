// Import all models
import User from './User';
import Patient from './Patient';
import Doctor from './Doctor';
import MedicalVisit from './MedicalVisit';
import Prescription from './Prescription';
import PrescriptionItem from './PrescriptionItem';
import QRCode from './QRCode';
import PharmacyLog from './PharmacyLog';

// Export all models
export {
  User,
  Patient,
  Doctor,
  MedicalVisit,
  Prescription,
  PrescriptionItem,
  QRCode,
  PharmacyLog
};

// Export enums and types
export { UserRole } from './User';
export { VisitType } from './MedicalVisit';
export { PrescriptionStatus } from './Prescription';
export { PharmacyAction } from './PharmacyLog';

// This file ensures all models are loaded and associations are established
export default {
  User,
  Patient,
  Doctor,
  MedicalVisit,
  Prescription,
  PrescriptionItem,
  QRCode,
  PharmacyLog
};
