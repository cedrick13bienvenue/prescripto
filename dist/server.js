"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database/config/database");
require("./models");
const routes_1 = require("./routes");
const swaggerRoutes_1 = require("./routes/swaggerRoutes");
const validation_1 = require("./middleware/validation");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env['PORT'] || 3000;
// Basic middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(validation_1.sanitizeInput);
// Serve static files from public directory
app.use(express_1.default.static('public'));
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'MedConnect server is running',
    });
});
// API routes - Using the combined router  
app.use('/api/v1', routes_1.routers);
// Swagger routes (separate mount for docs at /api/v1/docs)
app.use('/api/v1', swaggerRoutes_1.swaggerRouter);
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
        await (0, database_1.connectDatabase)();
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
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
