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

/**
 * Result type for generation operations
 * @description Represents the response from code generation services with positioning information
 */
export interface GenerationResult {
  /** Starting line number for code insertion (1-based indexing) */
  lineStart: number
  /** Starting character position for code insertion (0-based indexing) */
  charStart: number
  /** Ending line number for code replacement (1-based indexing) */
  lineEnd: number
  /** Ending character position for code replacement (0-based indexing) */
  charEnd: number
  /** Generated code content to insert or replace */
  content: string
  /** Descriptive title of the code suggestion */
  title: string
}

/**
 * Chat request structure for model communication
 * @description Defines the structure for sending chat requests to text generation models
 */
export interface ChatRequest {
  /** Name of the model to use for text generation */
  model: string
  /** Array of conversation messages with role and content */
  messages: Array<{ role: string; content: string }>
  /** Generation parameters and options */
  options: { temperature: number }
  /** Duration to keep the model loaded in memory */
  keep_alive: string
  /** Thinking mode configuration for the model */
  think: boolean | 'low' | 'medium' | 'high'
  /** Whether to stream the response or return complete response */
  stream: boolean
  /** Optional output format specification for structured responses */
  format?: object
}
