/**
 * Log level type for application logging
 * @description Defines available logging severity levels
 */
export type LogLevel = 'error' | 'warning' | 'info'

/**
 * Event type for completion events
 * @description Defines available event types for completion operations
 */
export type EventType = 'pending' | 'accept' | 'dismiss'

/**
 * Completion type for completion events
 * @description Defines the category of completion events
 */
export type CompletionType = 'action' | 'completion' | 'lint'

/**
 * Result type for completion operations
 * @description Represents the response from completion services, can be a string or null
 */
export type CompletionResult = string | null
