import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';

const routers = Router();

const allRoutes = [authRoutes, patientRoutes];

routers.use('/api', ...allRoutes);

export { routers };