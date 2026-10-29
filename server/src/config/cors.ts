/**
 * CORS (Cross-Origin Resource Sharing) configuration.
 * 
 * CORS controls which websites/apps can talk to your API.
 * Without it, a browser would block requests from your mobile app
 * or admin panel to the API server.
 */

import { CorsOptions } from 'cors';
import { env, isProduction } from './env';

/**
 * Parse the CORS_ORIGINS environment variable into an array of allowed origins.
 * In development, we're permissive. In production, lock it down.
 */
const allowedOrigins = env.CORS_ORIGINS.split(',').map(origin => origin.trim());

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin) || !isProduction) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // Cache preflight requests for 24 hours
};
