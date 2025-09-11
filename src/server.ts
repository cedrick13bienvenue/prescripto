import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './database/config/database';
import './models'; 
import { routers } from './routes';
import { swaggerRouter } from './routes/swaggerRoutes';
import { sanitizeInput } from './middleware/validation';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(sanitizeInput);

// Serve static files from public directory
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'MedConnect server is running',
  });
});

// API routes - Using the combined router  
app.use('/api/v1', routers);

// Swagger routes (separate mount for docs at /api/v1/docs)
app.use('/api/v1', swaggerRouter);

// Basic API endpoint
app.get('/api/v1', (_req, res) => {
  res.json({
    message: 'MedConnect API v1',
    status: 'Database models loaded and ready',
    endpoints: {
      health: '/health',
      api: '/api/v1'
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
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
      console.log('🗄️ Database: Connected and models loaded');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
