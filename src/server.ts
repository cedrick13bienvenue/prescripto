import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import './models'; // Import all models to establish associations

// Import routes
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import { swaggerRouter } from './routes/swaggerRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'MedConnect server is running'
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1', swaggerRouter);

// Basic API endpoint
app.get('/api/v1', (_req, res) => {
  res.json({
    message: 'MedConnect API v1',
    status: 'Authentication system ready',
    documentation: {
      swagger: '/api/v1/docs',
      swaggerJson: '/api/v1/docs.json'
    },
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/api/v1/auth',
      authEndpoints: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        profile: 'GET /api/v1/auth/profile',
        updateProfile: 'PUT /api/v1/auth/profile',
        changePassword: 'PUT /api/v1/auth/change-password',
        deactivateUser: 'PUT /api/v1/auth/users/:userId/deactivate (Admin)',
        reactivateUser: 'PUT /api/v1/auth/users/:userId/reactivate (Admin)'
      },
      patientEndpoints: {
        register: 'POST /api/v1/patients/register',
        search: 'GET /api/v1/patients/search?query=...',
        getById: 'GET /api/v1/patients/:patientId',
        update: 'PUT /api/v1/patients/:patientId',
        getHistory: 'GET /api/v1/patients/:patientId/history (Doctor/Admin)',
        createVisit: 'POST /api/v1/patients/:patientId/visits (Doctor/Admin)',
        createPrescription: 'POST /api/v1/patients/:patientId/prescriptions (Doctor/Admin)',
        getPrescriptions: 'GET /api/v1/patients/:patientId/prescriptions (Doctor/Admin)',
        crossHospitalLookup: 'GET /api/v1/patients/reference/:referenceNumber'
      }
    }
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 MedConnect server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/v1/auth`);
      console.log(`👥 Patient API: http://localhost:${PORT}/api/v1/patients`);
      console.log(`🗄️ Database: Connected and models loaded`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;