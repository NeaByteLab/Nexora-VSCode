import * as vscode from 'vscode'
import { CheckConfig, SelectModel, SelectDatabase, TestService } from '@cmd/index'
import { FileListener } from '@listeners/index'
import { OllamaService } from '@services/index'
import { configSection, vscodeSettingsCommand, vscodeSettingsFilter } from '@constants/index'

/** Service instance for handling code generation operations */
let ollamaService: OllamaService
/** Service instance for monitoring file changes and cursor position */
let fileListener: FileListener

/**
 * Initializes the extension when activated
 * @description Sets up services, listeners, and registers commands for the extension
 * @param context - Extension context for managing subscriptions and lifecycle
 */
export function activate(context: vscode.ExtensionContext): void {
  /** Initialize Ollama service for code generation */
  ollamaService = new OllamaService()
  /** Initialize file listener for monitoring editor changes */
  fileListener = new FileListener(ollamaService, context)
  fileListener.start()
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
 * Cleans up resources when the extension is deactivated
 * @description Called when the editor shuts down or extension is disabled
 */
export function deactivate(): void {
  fileListener.stop()
}
