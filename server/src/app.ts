/**
 * ChargeKaro API Server
 * 
 * This is the main entry point for the backend.
 * It sets up Express with all middleware and routes,
 * then starts listening for requests.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { corsOptions } from './config/cors';
import { testConnection } from './config/database';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { v1Routes } from './routes/v1';
import { logger } from './utils/logger';

const app = express();

// --- Security Middleware ---
// helmet() sets various HTTP security headers (e.g., X-Content-Type-Options,
// X-Frame-Options) to protect against common web vulnerabilities.
app.use(helmet());

// CORS — controls which origins can access the API
app.use(cors(corsOptions));

// Parse JSON request bodies (limit size to prevent abuse)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Rate limiting — applied to all routes
app.use(generalLimiter);

// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// --- API Routes ---
app.use(`/api/${env.API_VERSION}`, v1Routes);

// Root endpoint — basic API info
app.get('/', (_req, res) => {
  res.json({
    name: 'ChargeKaro API',
    version: '0.1.0',
    description: "India's EV Charging Marketplace",
    docs: `/api/${env.API_VERSION}/health`,
  });
});

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  });
});

// Centralized error handler — must be last
app.use(errorHandler);

// --- Start Server ---
async function start() {
  // Test database connection before accepting requests
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    logger.error('Cannot start server: database connection failed');
    logger.info('Check your DATABASE_URL in .env file');
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      `⚡ ChargeKaro API running on http://localhost:${env.PORT}`,
    );
    logger.info(`📚 API: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`);
  });
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});

export { app };
