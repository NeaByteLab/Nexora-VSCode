import knex, { Knex } from 'knex'
import { AccountData } from '@interfaces/index'
import { ErrorHandler } from '@utils/index'
import { defaultDatabasePath } from '@constants/index'

/**
 * Database configuration object for SQLite connection
 * Contains client settings, connection details, and pool configuration
 */
const config: Knex.Config = {
  client: 'better-sqlite3',
  connection: {
    filename: defaultDatabasePath
  },
  pool: {
    min: 1,
    max: 5
  },
  useNullAsDefault: true
}

/**
 * Database connection instance
 * Pre-configured Knex instance for database operations
 */
const database: Knex = knex(config)

/**
 * Account management utility
 * Handles account retrieval from database with rate limiting support
 */
export default class AccountManager {
  /**
   * Gets a random account without rate limits
   * Finds accounts with no hourly or daily limits and returns a random selection
   * @returns Promise resolving to account data or null if none found
   */
  static async getRandomAccount(): Promise<AccountData | null> {
    try {
      const result: AccountData | undefined = await database<AccountData>('accounts')
        .whereNull('limit_hourly')
        .whereNull('limit_daily')
        .orderByRaw('RANDOM()')
        .first()
      return result ?? null
    } catch (error: unknown) {
      ErrorHandler.handleDatabaseError(error, 'getRandomAccount')
      return null
    }
  }
}
