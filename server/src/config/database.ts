/**
 * PostgreSQL database connection pool.
 * 
 * WHY A POOL: A connection pool keeps a set of database connections
 * open and ready to use. When your code needs to run a query, it
 * borrows a connection from the pool, uses it, and returns it.
 * This is much faster than opening a new connection for every query.
 * 
 * We use the 'pg' library directly (not an ORM) because:
 * 1. PostGIS queries are easier to write in raw SQL
 * 2. You can see and understand every query
 * 3. Better control over transactions and performance
 */

import { Pool, QueryResultRow } from 'pg';
import { env, isProduction } from './env';
import { logger } from '../utils/logger';

/** The database connection pool — shared across the entire server */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  
  // Pool size settings
  max: isProduction ? 20 : 5,        // Max connections in the pool
  idleTimeoutMillis: 30000,           // Close idle connections after 30s
  connectionTimeoutMillis: 10000,     // Fail if can't connect in 10s
  
  // SSL required for Neon and most managed databases
  ssl: env.DATABASE_URL.includes('neon.tech') || isProduction
    ? { rejectUnauthorized: false }
    : undefined,
});

// Log when a connection is established (helpful for debugging)
pool.on('connect', () => {
  logger.debug('New database connection established');
});

// Log connection errors
pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected database pool error');
});

/**
 * Run a single SQL query.
 * 
 * @example
 * const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
 * const user = result.rows[0];
 */
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  // Log slow queries (> 500ms) so you can optimize them
  if (duration > 500) {
    logger.warn({ query: text, duration, rows: result.rowCount }, 'Slow query detected');
  }

  return result;
}

/**
 * Get a client from the pool for running transactions.
 * 
 * IMPORTANT: Always release the client back to the pool!
 * Use try/finally to ensure this happens even if an error occurs.
 * 
 * @example
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   await client.query('INSERT INTO ...', [...]);
 *   await client.query('UPDATE ...', [...]);
 *   await client.query('COMMIT');
 * } catch (err) {
 *   await client.query('ROLLBACK');
 *   throw err;
 * } finally {
 *   client.release(); // Always release!
 * }
 */
export async function getClient() {
  return pool.connect();
}

/**
 * Test the database connection.
 * Called at server startup to fail fast if the DB is unreachable.
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now, PostGIS_Version() as postgis_version');
    logger.info(
      { 
        serverTime: result.rows[0].now,
        postgisVersion: result.rows[0].postgis_version 
      },
      'Database connected successfully'
    );
    return true;
  } catch (err: any) {
    // PostGIS might not be installed yet — try without it
    try {
      const result = await query('SELECT NOW() as now');
      logger.warn(
        { serverTime: result.rows[0].now },
        'Database connected but PostGIS is not available. Run CREATE EXTENSION postgis;'
      );
      return true;
    } catch (innerErr) {
      logger.error({ err: innerErr }, 'Failed to connect to database');
      return false;
    }
  }
}
