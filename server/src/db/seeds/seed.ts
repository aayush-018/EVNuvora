/**
 * Database seed script.
 * 
 * Populates the database with sample data for development.
 * This data is clearly labelled as fake/sample — it does NOT
 * represent real charging infrastructure.
 * 
 * Usage: npm run db:seed
 */

import { pool } from '../../config/database';
import { logger } from '../../utils/logger';

async function seed() {
  logger.info('🌱 Seeding database with sample data...');
  
  // Seeds will be added in Phase 3 when we create the charger tables
  logger.info('No seeds to apply yet. Seeds will be added in Phase 3.');

  await pool.end();
}

seed().catch((err) => {
  logger.error({ err }, 'Seeding failed');
  process.exit(1);
});
