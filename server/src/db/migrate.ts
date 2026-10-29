/**
 * Database migration runner.
 * 
 * Reads SQL migration files from the migrations/ directory and
 * applies them in order. Tracks which migrations have been applied
 * in a 'migrations' table so they're only run once.
 * 
 * Usage:
 *   npm run db:migrate          # Apply pending migrations
 *   npm run db:migrate -- --reset  # Drop all and re-apply (DEVELOPMENT ONLY!)
 */

import fs from 'fs';
import path from 'path';
import { pool, query } from '../config/database';
import { logger } from '../utils/logger';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(): Promise<string[]> {
  const result = await query('SELECT name FROM migrations ORDER BY id');
  return result.rows.map((r: any) => r.name);
}

async function runMigrations() {
  const isReset = process.argv.includes('--reset');

  if (isReset) {
    logger.warn('⚠️  Resetting database — dropping all tables');
    await query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    // Re-enable PostGIS after schema reset
    await query('CREATE EXTENSION IF NOT EXISTS postgis').catch(() => {
      logger.warn('PostGIS extension not available — geographic features will not work');
    });
  }

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  // Get all .sql files in the migrations directory
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    logger.info('No migrations directory found. Creating it...');
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    logger.info('Migrations directory created. Add .sql files to run migrations.');
    await pool.end();
    return;
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Sort alphabetically — migration files are numbered (001_, 002_, etc.)

  let appliedCount = 0;
  for (const file of files) {
    if (applied.includes(file)) {
      logger.debug(`Skipping already applied: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    logger.info(`Applying migration: ${file}`);

    try {
      await query('BEGIN');
      await query(sql);
      await query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      await query('COMMIT');
      appliedCount++;
      logger.info(`✅ Applied: ${file}`);
    } catch (err) {
      await query('ROLLBACK');
      logger.error({ err, migration: file }, `❌ Failed to apply: ${file}`);
      throw err;
    }
  }

  if (appliedCount === 0) {
    logger.info('No pending migrations.');
  } else {
    logger.info(`Applied ${appliedCount} migration(s).`);
  }

  await pool.end();
}

runMigrations().catch((err) => {
  logger.error({ err }, 'Migration failed');
  process.exit(1);
});
