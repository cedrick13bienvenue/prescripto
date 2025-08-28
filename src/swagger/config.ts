import swaggerJsdoc from 'swagger-jsdoc';

// Import path definitions
import authPaths from './paths/auth';
import patientPaths from './paths/patients';

// Import schema definitions
import authSchemas from './schemas/auth';
import patientSchemas from './schemas/patients';
import commonSchemas from './schemas/common';

const options: any = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedConnect API Documentation',
      version: '1.0.0',
      description: 'Digital Prescription & Patient Records System API',
      contact: {
        name: 'MedConnect Team',
        email: 'support@medconnect.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3300/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.medconnect.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication'
        }
      },
      schemas: {
        ...commonSchemas,
        ...authSchemas,
        ...patientSchemas
      }
    },

    paths: {
      ...authPaths,
      ...patientPaths
    }
  },
  apis: [] // We're using YAML files instead of JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(options);
