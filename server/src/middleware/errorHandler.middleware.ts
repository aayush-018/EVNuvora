/**
 * Centralized error handling middleware.
 * 
 * This is the LAST middleware in the Express chain. Any error thrown
 * or passed to next(error) anywhere in the app ends up here.
 * It formats the error into a consistent JSON response.
 * 
 * WHY CENTRALIZED: Without this, every route would need its own
 * try/catch and error formatting. This keeps error handling DRY
 * (Don't Repeat Yourself).
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { isProduction } from '../config/env';

/**
 * Express error-handling middleware.
 * Must have 4 parameters (err, req, res, next) for Express to recognize it.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // --- Zod Validation Errors ---
  // These occur when request body/params/query don't match the schema
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.');
      if (!details[field]) details[field] = [];
      details[field].push(issue.message);
    }

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details,
      },
    });
    return;
  }

  // --- Our Custom App Errors ---
  // These are expected errors with proper status codes
  if (err instanceof AppError) {
    // Only log 500+ errors at error level
    if (err.statusCode >= 500) {
      logger.error({ err, url: req.url, method: req.method }, err.message);
    } else {
      logger.warn({ code: err.code, url: req.url, method: req.method }, err.message);
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // --- Unexpected Errors (bugs) ---
  // These should never happen in normal operation
  logger.error(
    { err, url: req.url, method: req.method, body: req.body },
    'Unhandled error',
  );

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction
        ? 'An unexpected error occurred'
        : err.message, // Show details in development for debugging
      // Never expose stack traces in production
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
}

/**
 * Wraps an async route handler to catch errors automatically.
 * Without this, you'd need try/catch in every async route.
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.getAll();
 *   res.json({ success: true, data: users });
 * }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
