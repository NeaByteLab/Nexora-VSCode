import * as vscode from 'vscode'
import activateEventCommand from '@eventCommand'
import { updateConfigCache, ConfigManager } from '@config/index'
import { ErrorLense, CompletionEvent, StatusBarItem } from '@integrator/index'
import { ErrorHandler } from '@utils/index'

/** Service instance for managing completion events */
let completionEvent: CompletionEvent
/** Service instance for managing error lens display */
let errorLense: ErrorLense

/**
 * Initializes the extension when activated
 * @description Sets up services, listeners, and registers commands for the extension
 * @param context - Extension context for managing subscriptions and lifecycle
 */
export function activate(context: vscode.ExtensionContext): void {
  try {
    /** Initialize config cache */
    updateConfigCache()
    ConfigManager.onDidChangeConfiguration(() => {
      updateConfigCache()
    })
    /** Initialize inline completion */
    completionEvent = new CompletionEvent(context)
    completionEvent.initialize()
    /** Initialize error lens for diagnostic display */
    errorLense = new ErrorLense(context)
    errorLense.initialize()
    /** Activate command */
    activateEventCommand(context)
  } catch (error: unknown) {
    ErrorHandler.handle(error, 'extension activation', true, 'error')
  }
}

/**
 * Cleans up resources when the extension is deactivated
 * @description Called when the editor shuts down or extension is disabled
 */
export function deactivate(): void {
  StatusBarItem.dispose()
}
