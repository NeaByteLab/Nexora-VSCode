import * as vscode from 'vscode'
import activatedEventCommand from '@eventCommand'
import { updateConfigCache, ConfigManager } from '@config/index'
import { InlineCompletion } from '@integrator/index'
import { OllamaService } from '@services/index'

/** Service instance for handling code generation operations */
let ollamaService: OllamaService
/** Service instance for managing inline completion providers */
let inlineCompletion: InlineCompletion

/**
 * Initializes the extension when activated
 * @description Sets up services, listeners, and registers commands for the extension
 * @param context - Extension context for managing subscriptions and lifecycle
 */
export function activate(context: vscode.ExtensionContext): void {
  /** Initialize config cache */
  updateConfigCache()
  ConfigManager.onDidChangeConfiguration(() => {
    updateConfigCache()
  })
  /** Initialize Ollama service for code generation */
  ollamaService = new OllamaService()
  /** Initialize completion API for inline suggestions */
  inlineCompletion = new InlineCompletion(ollamaService, context)
  inlineCompletion.start()
  /** Activate command */
  activatedEventCommand(context, ollamaService)
}

/**
 * Cleans up resources when the extension is deactivated
 * @description Called when the editor shuts down or extension is disabled
 */
export function deactivate(): void {
  return undefined
}
