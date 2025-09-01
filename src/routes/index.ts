import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';
import { swaggerRouter } from './swaggerRoutes';

const routers = Router();

const allRoutes = [authRoutes, patientRoutes, swaggerRouter];

routers.use('/api', ...allRoutes);

export { routers };