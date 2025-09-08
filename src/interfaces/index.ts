/**
 * Log level type for error handling
 * @description Defines available logging severity levels
 */
export type LogLevel = 'error' | 'warning' | 'info'

/**
 * Result type for completion operations
 * @description Represents the response from text generation services
 */
export type CompletionResult = string | null

/**
 * Result type for generation operations
 * @description Represents the response from code generation services
 */
export interface GenerationResult {
  /** Starting line number */
  lineStart: number
  /** Ending line number */
  lineEnd: number
  /** Content to write to the file */
  content: string
  /** Title of the code suggestion and completion */
  title: string
}

/**
 * Chat request structure for model communication
 * @description Defines the structure for sending chat requests to AI models
 */
export interface ChatRequest {
  /** Model identifier */
  model: string
  /** Array of conversation messages */
  messages: Array<{ role: string; content: string }>
  /** Generation options */
  options: { temperature: number }
  /** Keep alive duration */
  keep_alive: string
  /** Thinking mode setting */
  think: boolean | 'low' | 'medium' | 'high'
  /** Stream response flag */
  stream: boolean
  /** Optional output format specification */
  format?: object
}

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
  /** Hourly request limit (null if unlimited) */
  limit_hourly: number | null
  /** Daily request limit (null if unlimited) */
  limit_daily: number | null
}

/**
 * Configuration data structure
 * @description Contains application configuration settings
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
 * @description Contains information about the active file and cursor position
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
