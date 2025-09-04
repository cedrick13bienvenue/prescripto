import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';
import doctorRoutes from './doctors';

const routers = Router();

const allRoutes = [authRoutes, patientRoutes, doctorRoutes];

routers.use('/', ...allRoutes);

export { routers };