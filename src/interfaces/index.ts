/**
 * Log level type for error handling
 * Defines available logging severity levels
 */
export type LogLevel = 'error' | 'warning' | 'info'

/**
 * Result type for completion operations
 * Represents the response from text generation services
 */
export type CompletionResult = string | null

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

/**
 * File context data structure
 * Contains information about the active file and cursor position
 */
export interface FileContextData {
  /** Full file path */
  filePath: string
  /** File name with extension */
  fileName: string
  /** File name without extension */
  fileNameWithoutExt: string
  /** File extension */
  fileExtension: string
  /** Language ID (typescript, javascript, etc.) */
  languageId: string
  /** Current line number (1-based) */
  lineNumber: number
  /** Current character position (1-based) */
  characterPosition: number
  /** Current line text */
  currentLineText: string
  /** Text before cursor */
  textBeforeCursor: string
  /** Text after cursor */
  textAfterCursor: string
  /** Total lines in file */
  totalLines: number
  /** Is file saved */
  isDirty: boolean
}
