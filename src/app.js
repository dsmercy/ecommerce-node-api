import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import logger from './utils/logger.js';
import { apiResponse } from './utils/response.js';
import { errorHandler } from './middlewares/error.middleware.js';
import apiRouter from './routes/index.js';

const app = express();

// Connect to MongoDB
await connectDB();

// Middleware
app.use(pinoHttp({ logger }));
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  apiResponse(res, {
    status: 'ok',
    uptime: process.uptime(),
    environment: env.nodeEnv,
  });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api', apiRouter);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(env.port, () => {
  logger.info(`Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
  logger.info(`Swagger UI available at http://localhost:${env.port}/api-docs`);
});

export default app;
