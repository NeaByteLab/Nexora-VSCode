import * as vscode from 'vscode'
import activateEventCommand from '@eventCommand'
import { updateConfigCache, ConfigManager } from '@config/index'
import { CompletionEvent, StatusBarItem } from '@integrator/index'
import { LogHandler } from '@utils/index'

/**
 * Initializes the extension when activated.
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
    new CompletionEvent(context).initialize()
    /** Activate command */
    activateEventCommand(context)
  } catch (error: unknown) {
    LogHandler.handle(error, 'extension activation', true, 'error')
  }
}

/**
 * Cleans up resources when the extension is deactivated.
 * @description Called when the editor shuts down or extension is disabled
 */
export function deactivate(): void {
  StatusBarItem.dispose()
}
