import { EventType } from '@interfaces/index'

/**
 * Chat request structure for model communication
 * @description Defines the structure for sending chat requests to models
 */
export interface ChatRequest {
  /** Name of the model to use */
  model: string
  /** Array of conversation messages with role and content */
  messages: Array<{ role: string; content: string }>
  /** Generation parameters and options */
  options: { temperature: number }
  /** Duration to keep the model loaded in memory */
  keep_alive: string
  /** Thinking mode configuration */
  think: boolean | 'low' | 'medium' | 'high'
  /** Whether to stream the response or return complete response */
  stream: boolean
  /** Optional output format specification */
  format?: object
}

/**
 * Result type for generation operations
 * @description Represents the response from generation services with positioning information
 */
export interface GenerationResult {
  /** Type of the generation */
  type: string
  /** Old content of the generation */
  oldContent: string
  /** New content of the generation */
  newContent: string
  /** Descriptive title of the code suggestion */
  title: string
}

/**
 * File tracker data structure for tracking completion state
 * @description Contains file metadata and completion range information
 */
export interface FileTrackerData extends GenerationResult {
  /** The title of the completion */
  resTitle: string
  /** The URI of the file containing the file tracker */
  fileUri: string
  /** The language of the file when file tracker was set */
  fileLang: string
  /** The version of the file when file tracker was set */
  fileVersion: number
  /** The state of the file when file tracker was set */
  fileState: EventType
}
