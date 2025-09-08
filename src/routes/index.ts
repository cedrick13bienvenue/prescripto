import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';
import doctorRoutes from './doctors';
import qrCodeRoutes from './qrCodes';

const routers = Router();

const allRoutes = [authRoutes, patientRoutes, doctorRoutes, qrCodeRoutes];

routers.use('/', ...allRoutes);

export { routers };