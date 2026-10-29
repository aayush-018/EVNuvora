/**
 * Custom error classes for the API.
 * 
 * These provide consistent error handling across the application.
 * Each error type maps to an HTTP status code and a machine-readable
 * error code that the frontend can use for translation/handling.
 */

/**
 * Base class for all API errors.
 * Extends the built-in Error class with HTTP status and error code.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Expected errors (not bugs)
    this.details = details;
    
    // Maintains proper stack trace in V8 (Node.js)
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 - The request is malformed or has invalid data */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: Record<string, string[]>) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

/** 401 - No valid authentication credentials provided */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/** 403 - Authenticated but not allowed to perform this action */
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}

/** 404 - The requested resource doesn't exist */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/** 409 - Conflict with current state (e.g., duplicate booking) */
export class ConflictError extends AppError {
  constructor(message = 'Conflict with current state') {
    super(message, 409, 'CONFLICT');
  }
}

/** 422 - Request is valid but can't be processed (business logic error) */
export class UnprocessableError extends AppError {
  constructor(message = 'Cannot process this request') {
    super(message, 422, 'UNPROCESSABLE');
  }
}

/** 429 - Too many requests */
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

/** 500 - Unexpected server error */
export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}
