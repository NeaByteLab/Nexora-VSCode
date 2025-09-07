import knex, { Knex } from 'knex'
import { AccountData } from '@interfaces/index'
import { ErrorHandler } from '@utils/index'

/**
 * Account management utility
 * Handles account retrieval from database with rate limiting support
 */
export default class KnexManager {
  private readonly database: Knex

  /**
   * Creates a new KnexManager instance
   * @param filename - Path to the SQLite database file
   */
  constructor(filename: string) {
    this.database = knex({
      client: 'sqlite3',
      connection: {
        filename
      },
      pool: {
        min: 1,
        max: 5
      },
      useNullAsDefault: true
    })
  }

  /**
   * Gets a random account without rate limits
   * Finds accounts with no hourly or daily limits and returns a random selection
   * @returns Promise resolving to account data or null if none found
   */
  async getRandomAccount(): Promise<AccountData | null> {
    try {
      const result: AccountData | undefined = await this.database<AccountData>('accounts')
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
