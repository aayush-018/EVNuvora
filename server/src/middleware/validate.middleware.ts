/**
 * Request validation middleware using Zod.
 * 
 * This middleware validates the request body, query parameters,
 * or URL parameters against a Zod schema BEFORE the route handler
 * runs. If validation fails, it returns a 400 error with details
 * about what's wrong.
 * 
 * WHY: Never trust data from the client. Even if the mobile app
 * validates a form, someone could send a crafted HTTP request
 * directly to your API. Always validate on the server.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

interface ValidateOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Creates a validation middleware for the specified request parts.
 * 
 * @example
 * // Validate request body
 * router.post('/users', validate({ body: createUserSchema }), createUser);
 * 
 * // Validate query parameters
 * router.get('/chargers', validate({ query: searchSchema }), searchChargers);
 * 
 * // Validate URL parameters and body
 * router.patch('/chargers/:id', 
 *   validate({ params: idParamSchema, body: updateChargerSchema }),
 *   updateCharger
 * );
 */
export function validate(schemas: ValidateOptions) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      next();
    } catch (err) {
      next(err); // Zod errors are caught by errorHandler middleware
    }
  };
}
