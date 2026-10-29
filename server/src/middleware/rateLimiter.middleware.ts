/**
 * Rate limiting middleware.
 * 
 * Prevents abuse by limiting how many requests a single IP
 * can make in a time window. Essential for:
 * - Preventing brute-force login attacks
 * - Protecting against API abuse
 * - Keeping costs manageable
 */

import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/** General rate limiter for all API routes */
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,   // 15 minutes by default
  max: env.RATE_LIMIT_MAX_REQUESTS,      // 100 requests per window
  standardHeaders: true,                  // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please try again later.',
    },
  },
});

/** Strict rate limiter for authentication endpoints */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // Only 10 login/register attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
  },
});

/** Rate limiter for payment endpoints */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,                // 5 payment attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many payment attempts. Please wait a moment.',
    },
  },
});
