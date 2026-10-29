/**
 * EVNuvora API Server - Production Hardened
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { corsOptions } from './config/cors';
import { pool, testConnection } from './config/database';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { v1Routes } from './routes/v1';
import { logger } from './utils/logger';

const app = express();

// Trust reverse proxy (Railway, Render, AWS ALB, Nginx, Cloudflare)
// Essential for rate-limiting, secure cookies, and accurate client IP logging behind HTTPS termination
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(cors(corsOptions));

// Body parsing with sane size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(generalLimiter);

// Request logger
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// API Routes
app.use(`/api/${env.API_VERSION}`, v1Routes);

// Root info endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'EVNuvora API',
    version: '0.1.0',
    description: "India's EV Charging Marketplace",
    status: 'online',
    health: `/api/${env.API_VERSION}/health`,
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  });
});

// Central error handler
app.use(errorHandler);

// Start Server & Graceful Shutdown management
async function start() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.error('Cannot start server: database connection failed');
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      `⚡ EVNuvora API running on port ${env.PORT}`,
    );
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Received termination signal. Closing HTTP server & database pool gracefully...');
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await pool.end();
        logger.info('Database pool drained successfully.');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during database pool closure');
        process.exit(1);
      }
    });

    // Force close after 10 seconds if hanging
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});

export { app };
