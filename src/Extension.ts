import * as vscode from 'vscode'
import { CheckConfig, SelectModel } from '@cmd/index'
import { ConfigManager } from '@config/index'
import { OllamaService } from '@services/index'

/** Extension services */
let ollamaService: OllamaService

/**
 * Activates the extension when VSCode starts
 * @param context - VSCode extension context for managing subscriptions
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
  void ensureModelSelected()
}

/**
 * Deactivates the extension when VSCode shuts down
 * Cleans up resources and subscriptions
 */
export function deactivate(): undefined | void {
  return undefined
}

/**
 * Ensures a model is selected on startup
 * Automatically selects the first available model if none is currently selected
 */
async function ensureModelSelected(): Promise<void> {
  try {
    const models: string[] = await ollamaService.getModels()
    if (models.length > 0 && models[0] !== undefined && models[0] !== '') {
      await ConfigManager.setSelectedModel(models[0])
    }
  } catch {
    // Skip ErrorHandler
  }
}
