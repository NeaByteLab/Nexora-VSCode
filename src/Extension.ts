import * as vscode from 'vscode'
import { CheckConfig, SelectModel, SelectDatabase, TestService } from '@cmd/index'
import { FileListener } from '@listeners/index'
import { OllamaService } from '@services/index'
import { configSection, vscodeSettingsCommand, vscodeSettingsFilter } from '@constants/index'

/**
 * Global service instances for the extension.
 */
let ollamaService: OllamaService
let fileListener: FileListener

/**
 * Initializes the extension when activated.
 * Sets up services, listeners, and registers commands.
 * @param context - Extension context for managing subscriptions and lifecycle
 * @returns Promise that resolves when initialization is complete
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  /** Initialize Ollama service */
  ollamaService = new OllamaService()
  /** Initialize file listener - creates side effects (event listeners) */
  fileListener = new FileListener(ollamaService)
  await fileListener.start()
  /** Register open config command */
  const openConfigCommand: vscode.Disposable = vscode.commands.registerCommand(
    `${configSection}.OpenConfig`,
    (): void => {
      vscode.commands.executeCommand(vscodeSettingsCommand, vscodeSettingsFilter)
    }
  )
  /** Register check config command */
  const checkConfigCommand: vscode.Disposable = vscode.commands.registerCommand(
    `${configSection}.CheckConfig`,
    async (): Promise<void> => {
      await CheckConfig(ollamaService)
    }
  )
  /** Register select model command */
  const selectModelCommand: vscode.Disposable = vscode.commands.registerCommand(
    `${configSection}.SelectModel`,
    async (): Promise<void> => {
      await SelectModel(ollamaService)
    }
  )
  /** Register select database command */
  const selectDatabaseCommand: vscode.Disposable = vscode.commands.registerCommand(
    `${configSection}.SelectDatabase`,
    async (): Promise<void> => {
      await SelectDatabase()
    }
  )
  /** Register test service command */
  const testServiceCommand: vscode.Disposable = vscode.commands.registerCommand(
    `${configSection}.TestService`,
    async (): Promise<void> => {
      await TestService(ollamaService)
    }
  )
  /** Register commands */
  context.subscriptions.push(
    openConfigCommand,
    checkConfigCommand,
    selectModelCommand,
    selectDatabaseCommand,
    testServiceCommand
  )
}

/**
 * Cleans up resources when the extension is deactivated.
 * Called when the editor shuts down or extension is disabled.
 * @returns Promise that resolves when cleanup is complete
 */
export async function deactivate(): Promise<void> {
  await fileListener.stop()
}
