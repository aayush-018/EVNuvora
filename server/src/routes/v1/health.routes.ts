/**
 * Health check endpoint.
 * 
 * Used by load balancers, monitoring tools, and deployment
 * platforms to verify the server is running and can reach
 * the database.
 */

import { Router } from 'express';
import { pool } from '../../config/database';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    // Quick database connectivity check
    const dbResult = await pool.query('SELECT 1 as ok');
    const dbOk = dbResult.rows[0]?.ok === 1;

    res.status(dbOk ? 200 : 503).json({
      status: dbOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      services: {
        database: dbOk ? 'connected' : 'disconnected',
      },
    });
  } catch {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
      },
    });
  }
});

export { router as healthRoutes };
