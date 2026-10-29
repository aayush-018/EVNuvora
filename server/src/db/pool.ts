/**
 * Re-export database utilities for convenient imports.
 * 
 * Instead of importing from '../config/database', modules can
 * import from '../db/pool' which is shorter and more intuitive.
 */

export { pool, query, getClient, testConnection } from '../config/database';
