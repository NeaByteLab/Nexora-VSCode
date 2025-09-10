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
 * Ghost text data structure for tracking completion state
 * @description Extends GenerationResult with document tracking information
 * @extends GenerationResult
 */
export interface GhostTextData extends GenerationResult {
  /** The URI of the document containing the ghost text */
  documentUri: string
  /** The version of the document when ghost text was set */
  documentVersion: number
}
