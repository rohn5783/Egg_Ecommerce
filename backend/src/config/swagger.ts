import swaggerJSDoc from 'swagger-jsdoc';
import { ENV } from './env.js';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GoodEggs E-Commerce API',
      version: '1.0.0',
      description: 'Production-ready REST API for GoodEggs Farm-to-Consumer platform',
      contact: {
        name: 'GoodEggs Engineering',
        email: 'dev@goodeggs.farm',
      },
    },
    servers: [
      {
        url: `http://localhost:${ENV.PORT}/api/v1`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

