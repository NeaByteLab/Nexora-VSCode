import * as vscode from 'vscode'

/**
 * Log level type for error handling
 * @description Defines available logging severity levels
 */
export type LogLevel = 'error' | 'warning' | 'info'

/**
 * Event type for completion events
 * @description Defines available event types for completion
 */
export type EventType = 'show' | 'accept' | 'dismiss' | 'accept_word' | 'accept_line'

/**
 * Completion type for completion events
 * @description Defines available completion types for completion
 */
export type CompletionType = 'action' | 'completion' | 'lint'

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
  /** Starting line number for code insertion (1-based) */
  lineStart: number
  /** Starting character position for code insertion (0-based) */
  charStart: number
  /** Ending line number for code replacement (1-based) */
  lineEnd: number
  /** Ending character position for code replacement (0-based) */
  charEnd: number
  /** Generated code content to insert */
  content: string
  /** Descriptive title of the code suggestion */
  title: string
}

/**
 * Chat request structure for model communication
 * @description Defines the structure for sending chat requests to AI models
 */
export interface ChatRequest {
  /** Name of the model to use for generation */
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

/**
 * Account data structure for user authentication and rate limiting
 * @description Contains user credentials and API usage limits
 */
export interface AccountData {
  /** User email address for account identification */
  email: string
  /** User password for authentication */
  password: string
  /** API key for service authentication */
  api_key: string
  /** Maximum requests per hour (null indicates no limit) */
  limit_hourly: number | null
  /** Maximum requests per day (null indicates no limit) */
  limit_daily: number | null
}

/**
 * Configuration data structure
 * @description Contains application configuration settings
 */
export interface ConfigurationData {
  /** Service host URL for API communication */
  urlHost: string
  /** File path to the SQLite database */
  databasePath: string
  /** Name of the currently selected model */
  selectedModel: string
}

/**
 * File context data structure for document analysis
 * @description Contains file metadata and cursor position information
 */
export interface FileContextData {
  /** File metadata and properties */
  fileData: {
    /** Complete absolute file path */
    filePath: string
    /** File name including extension */
    fileName: string
    /** File name without extension */
    fileNameWithoutExt: string
    /** File extension without the dot */
    fileExtension: string
    /** Language identifier used by the editor */
    fileLanguageId: string
    /** Total number of lines in the document */
    fileTotalLines: number
    /** Whether the file has unsaved changes */
    fileIsDirty: boolean
  }
  /** Cursor position and text selection data */
  selectedData: {
    /** Text content of the line where cursor is positioned */
    selectedLineText: string
    /** Line number where cursor is positioned (1-based) */
    selectedLineNumber: number
    /** Character position within the current line (1-based) */
    selectedCharacterPosition: number
    /** All text content before the cursor position */
    selectedTextBeforeCursor: string
    /** All text content after the cursor position */
    selectedTextAfterCursor: string
  }
}

/**
 * Represents a semantic token segment with text content and metadata
 * @description Contains the text content, semantic type, modifiers, and range of the token
 */
export type SemanticSegment = {
  /** The text content of the token */
  text: string
  /** The semantic type of the token */
  tokenType: string
  /** Array of semantic modifiers applied to the token */
  tokenModifiers: string[]
  /** The range position of the token in the document */
  range: vscode.Range
}
