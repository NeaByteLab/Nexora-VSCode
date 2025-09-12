/**
 * Account data structure for user authentication and rate limiting
 * @description Contains user credentials and API usage limits
 */
export interface AccountData {
  /** User email address */
  email: string
  /** User password */
  password: string
  /** API key for authentication */
  api_key: string
  /** Maximum requests allowed per hour (null indicates no limit) */
  limit_hourly: number | null
  /** Maximum requests allowed per day (null indicates no limit) */
  limit_daily: number | null
}

/**
 * Configuration data structure
 * @description Contains application configuration settings
 */
export interface ConfigurationData {
  /** Service host URL */
  urlHost: string
  /** File path to the database file */
  databasePath: string
  /** Name of the currently selected model */
  selectedModel: string
}
