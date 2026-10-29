/**
 * Structured logger using Pino.
 * 
 * WHY STRUCTURED LOGGING: Instead of console.log("user logged in"),
 * structured logging outputs JSON like {"level":"info","msg":"user logged in","userId":"abc"}.
 * This makes it easy to search and filter logs in production.
 * 
 * In development, pino-pretty formats it nicely for your terminal.
 * In production, raw JSON is sent to your log aggregator.
 */

import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  
  transport: env.NODE_ENV !== 'production'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,

  // Redact sensitive fields from logs
  // This prevents passwords, tokens, and secrets from appearing in log files
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },

  // Base fields included in every log entry
  base: {
    service: 'chargekaro-api',
    env: env.NODE_ENV,
  },
});
