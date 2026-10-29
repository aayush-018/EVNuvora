/**
 * Environment configuration with Zod validation.
 * 
 * This file reads environment variables and validates them at startup.
 * If any required variable is missing or invalid, the server won't start
 * and you'll get a clear error message telling you what's wrong.
 * 
 * WHY: This prevents runtime crashes from missing config. It's much
 * better to fail fast at startup than to crash when a user makes a
 * payment and the Razorpay key is missing.
 */

import { z } from 'zod';
import path from 'path';

// Load .env file in development
if (process.env.NODE_ENV !== 'production') {
  // Dynamic import to avoid bundling dotenv in production
  try {
    require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
  } catch {
    // dotenv not installed — that's fine, use system env vars
  }
}

/**
 * Schema that defines all environment variables the server needs.
 * Each variable has a type, a default value (if optional), and
 * sometimes a transformation (like converting a string to a number).
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // JWT Authentication
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Google Maps (optional — can work without it initially)
  GOOGLE_MAPS_API_KEY: z.string().optional(),

  // Razorpay (optional — uses sandbox adapter if not configured)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // File Storage
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:8081,http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),  // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
});

// Parse and validate — throws a descriptive error if validation fails
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

/** Validated environment configuration */
export const env = parsed.data;

/** Helper to check if we're in production */
export const isProduction = env.NODE_ENV === 'production';

/** Helper to check if we're in development */
export const isDevelopment = env.NODE_ENV === 'development';

/** Helper to check if we're in test */
export const isTest = env.NODE_ENV === 'test';
