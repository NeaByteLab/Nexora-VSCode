import * as vscode from 'vscode'
import { CheckConfig, SelectModel, TestService } from '@cmd/index'
import { OllamaService } from '@services/index'
import { configSection, vscodeSettingsCommand, vscodeSettingsFilter } from '@constants/index'

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
  const openConfigCommand: vscode.Disposable = vscode.commands.registerCommand(
    `${configSection}.OpenConfig`,
    (): void => {
      vscode.commands.executeCommand(vscodeSettingsCommand, vscodeSettingsFilter)
    }
  )
  const checkConfigCommand: vscode.Disposable = vscode.commands.registerCommand(
    `${configSection}.CheckConfig`,
    async (): Promise<void> => {
      await CheckConfig(ollamaService)
    }
  )
  const selectModelCommand: vscode.Disposable = vscode.commands.registerCommand(
    `${configSection}.SelectModel`,
    async (): Promise<void> => {
      await SelectModel(ollamaService)
    }
  )
  const testServiceCommand: vscode.Disposable = vscode.commands.registerCommand(
    `${configSection}.TestService`,
    async (): Promise<void> => {
      await TestService(ollamaService)
    }
  )
  context.subscriptions.push(
    openConfigCommand,
    checkConfigCommand,
    selectModelCommand,
    testServiceCommand
  )
}

/**
 * Cleans up resources when extension is deactivated
 * Called when VSCode shuts down or extension is disabled
 */
export function deactivate(): undefined | void {
  return undefined
}
