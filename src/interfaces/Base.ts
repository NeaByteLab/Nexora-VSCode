/**
 * Log level type for error handling
 * @description Defines available logging severity levels for application logging
 */
export type LogLevel = 'error' | 'warning' | 'info'

/**
 * Event type for completion events
 * @description Defines available event types that can be triggered during completion operations
 */
export type EventType = 'show' | 'accept' | 'dismiss' | 'accept_word' | 'accept_line'

/**
 * Completion type for completion events
 * @description Defines the category of completion events that can be processed
 */
export type CompletionType = 'action' | 'completion' | 'lint'

/**
 * Result type for completion operations
 * @description Represents the response from text generation services, can be a string or null
 */
export type CompletionResult = string | null
