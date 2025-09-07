/**
 * Log level type for error handling
 * Defines available logging severity levels
 */
export type LogLevel = 'error' | 'warning' | 'info'

/**
 * Account data structure for user authentication and rate limiting
 * Contains user credentials and API usage limits
 */
export interface AccountData {
  /** User email address */
  email: string
  /** User password */
  password: string
  /** API key for authentication */
  api_key: string
  /** Hourly request limit (null if unlimited) */
  limit_hourly: number | null
  /** Daily request limit (null if unlimited) */
  limit_daily: number | null
}

/**
 * Configuration data structure
 * Contains extension configuration settings
 */
export interface ConfigurationData {
  /** Host URL */
  host: string
  /** Database path */
  databasePath: string
  /** Selected model */
  selectedModel: string
}
