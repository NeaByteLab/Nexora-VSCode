/**
 * Account data structure for user authentication and rate limiting
 * @description Contains user credentials and API usage limits for account management
 */
export interface AccountData {
  /** User email address for account identification */
  email: string
  /** User password for authentication */
  password: string
  /** API key for service authentication */
  api_key: string
  /** Maximum requests allowed per hour (null indicates no limit) */
  limit_hourly: number | null
  /** Maximum requests allowed per day (null indicates no limit) */
  limit_daily: number | null
}

/**
 * Configuration data structure
 * @description Contains application configuration settings for runtime behavior
 */
export interface ConfigurationData {
  /** Service host URL for API communication */
  urlHost: string
  /** File path to the SQLite database file */
  databasePath: string
  /** Name of the currently selected model for text generation */
  selectedModel: string
}
