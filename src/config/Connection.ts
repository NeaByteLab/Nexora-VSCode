import knex, { Knex } from 'knex'
import { ConfigManager } from '@config/index'

/**
 * Database configuration for SQLite connection
 * Sets up SQLite client with connection pool configuration
 */
const config: Knex.Config = {
  client: 'better-sqlite3',
  connection: {
    filename: ConfigManager.getDatabasePath()
  },
  pool: {
    min: 1,
    max: 5
  },
  useNullAsDefault: true
}

/**
 * Knex database instance for SQLite
 * Configured instance ready for database operations
 */
export default knex(config)
