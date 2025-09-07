import * as vscode from 'vscode'
import { CheckConfig, SelectModel } from '@cmd/index'
import { OllamaService } from '@services/index'

/**
 * Global service instances
 */
let ollamaService: OllamaService

/**
 * Initializes the extension when VSCode starts
 * @param context - Extension context for managing subscriptions
 */
export function activate(context: vscode.ExtensionContext): void {
  ollamaService = new OllamaService()
  const checkConfigCommand: vscode.Disposable = vscode.commands.registerCommand(
    'nexora-vscode.checkConfig',
    async (): Promise<void> => {
      await CheckConfig(ollamaService)
    }
  )
  const selectModelCommand: vscode.Disposable = vscode.commands.registerCommand(
    'nexora-vscode.selectModel',
    async (): Promise<void> => {
      await SelectModel(ollamaService)
    }
  )
  context.subscriptions.push(checkConfigCommand, selectModelCommand)
}

/**
 * Cleans up resources when extension is deactivated
 * Called when VSCode shuts down or extension is disabled
 */
export function deactivate(): undefined | void {
  return undefined
}
