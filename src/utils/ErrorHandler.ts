import * as vscode from 'vscode'
import { LogLevel } from '@interfaces/index'

/**
 * Console method mapping for log level typing
 */
const consoleMethods: Record<LogLevel, keyof Console> = {
  error: 'error',
  warning: 'warn',
  info: 'info'
} as const

/**
 * Centralized error handling utility
 * Provides consistent error handling, logging, and user notifications
 */
export default class ErrorHandler {
  /** Default message for unknown errors */
  private static readonly UNKNOWN_ERROR_MESSAGE: string = 'An unknown error occurred'
  /** Prefix for log messages */
  private static readonly LOG_PREFIX: string = '[Extension]'

  /**
   * Handles errors with consistent logging and user notification
   * @param error - The error to handle
   * @param context - Context description for better error tracking
   * @param showToUser - Whether to show error message to user (default: true)
   * @param logLevel - Log level for the error (default: 'error')
   */
  public static handle(
    error: unknown,
    context: string,
    showToUser: boolean = true,
    logLevel: LogLevel = 'error'
  ): void {
    const errorMessage: string = this.getErrorMessage(error)
    const fullContext: string = `${this.LOG_PREFIX} ${context}`
    this.logError(errorMessage, fullContext, logLevel)
    if (showToUser) {
      this.showUserNotification(errorMessage, logLevel)
    }
  }

  /**
   * Handles async operations with error catching
   * @param operation - The async operation to execute
   * @param context - Context description for error tracking
   * @param showToUser - Whether to show error message to user (default: true)
   * @returns Promise resolving to operation result or null if error occurred
   */
  public static async handleAsync<T>(
    operation: () => Promise<T>,
    context: string,
    showToUser: boolean = true
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error: unknown) {
      this.handle(error, context, showToUser)
      return null
    }
  }

  /**
   * Handles database operation errors
   * @param error - The database error
   * @param operation - Description of the database operation
   */
  public static handleDatabaseError(error: unknown, operation: string): void {
    this.handle(error, `Database operation failed: ${operation}`, true, 'error')
  }

  /**
   * Handles API service errors
   * @param error - The API service error
   * @param operation - Description of the API operation
   */
  public static handleOllamaError(error: unknown, operation: string): void {
    this.handle(error, `Ollama API error during ${operation}`, true, 'error')
  }

  /**
   * Handles configuration errors
   * @param error - The configuration error
   * @param setting - The configuration setting that failed
   */
  public static handleConfigError(error: unknown, setting: string): void {
    this.handle(error, `Configuration error for setting: ${setting}`, true, 'warning')
  }

  /**
   * Handles validation errors
   * @param error - The validation error
   * @param field - The field that failed validation
   */
  public static handleValidationError(error: unknown, field: string): void {
    this.handle(error, `Validation failed for field: ${field}`, true, 'warning')
  }

  /**
   * Extracts error message from unknown error type
   * @param error - The error to extract message from
   * @returns Formatted error message
   */
  private static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    if (error !== null && typeof error === 'object' && 'message' in error) {
      return String(error.message)
    }
    return this.UNKNOWN_ERROR_MESSAGE
  }

  /**
   * Logs error to VSCode output channel
   * @param message - Error message to log
   * @param context - Context information
   * @param level - Log level
   */
  private static logError(message: string, context: string, level: LogLevel): void {
    const timestamp: string = new Date().toISOString()
    const logMessage: string = `${timestamp} [${level.toUpperCase()}] ${context}: ${message}`
    const consoleMethod: keyof Console = consoleMethods[level]
    const consoleFn: (...args: string[]) => void = console[consoleMethod] as (
      ...args: string[]
    ) => void
    consoleFn(logMessage)
    try {
      const outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel('Extension')
      outputChannel.appendLine(logMessage)
    } catch {
      // VSCode API not available, skip output channel logging
    }
  }

  /**
   * Shows user notification based on error level
   * @param message - Error message to show
   * @param level - Error level
   */
  private static showUserNotification(message: string, level: LogLevel): void {
    switch (level) {
      case 'error':
        vscode.window.showErrorMessage(`Extension: ${message}`)
        break
      case 'warning':
        vscode.window.showWarningMessage(`Extension: ${message}`)
        break
      case 'info':
        vscode.window.showInformationMessage(`Extension: ${message}`)
        break
    }
  }

  /**
   * Creates a safe async function wrapper
   * @param fn - Function to wrap
   * @param context - Context for error handling
   * @returns Wrapped function with error handling
   */
  public static wrapAsync<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    context: string
  ): (...args: T) => Promise<R | null> {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args)
      } catch (error: unknown) {
        this.handle(error, context)
        return null
      }
    }
  }

  /**
   * Creates a safe sync function wrapper
   * @param fn - Function to wrap
   * @param context - Context for error handling
   * @returns Wrapped function with error handling
   */
  public static wrapSync<T extends unknown[], R>(
    fn: (...args: T) => R,
    context: string
  ): (...args: T) => R | null {
    return (...args: T): R | null => {
      try {
        return fn(...args)
      } catch (error: unknown) {
        this.handle(error, context)
        return null
      }
    }
  }
}
