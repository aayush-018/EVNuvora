/**
 * Extend the Express Request type to include our custom properties.
 * 
 * When the auth middleware verifies a JWT token, it attaches the
 * user information to req.user. This file tells TypeScript about
 * that property so you get autocompletion and type checking.
 */

import { UserRole } from '@chargekaro/shared';

declare global {
  namespace Express {
    interface Request {
      /** Authenticated user information (set by auth middleware) */
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export {};
