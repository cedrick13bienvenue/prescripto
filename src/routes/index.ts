import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';
import doctorRoutes from './doctors';
import pharmacistRoutes from './pharmacists';
import pharmacyRoutes from './pharmacy';
import qrCodeRoutes from './qrCodes';

const routers = Router();

const allRoutes = [authRoutes, patientRoutes, doctorRoutes, pharmacistRoutes, pharmacyRoutes, qrCodeRoutes];

routers.use('/', ...allRoutes);

export { routers };