import * as vscode from 'vscode'
import { CheckConfig, SelectModel, SelectDatabase, TestService } from '@cmd/index'
import { OllamaService } from '@services/index'
import { configSection, vscodeSettingsCommand, vscodeSettingsFilter } from '@constants/index'
import { StatusBarItem } from '@integrator/index'

/**
 * Activates extension configuration and registers commands.
 * @description Registers all extension commands and adds them to the context subscriptions
 * @param context - Extension context for managing subscriptions
 */
export default function (context: vscode.ExtensionContext): void {
  const ollamaService: OllamaService = new OllamaService()
  /** Register open configuration command */
  const openConfigCommand: vscode.Disposable = vscode.commands.registerCommand(
    `${configSection}.OpenConfig`,
    (): void => {
      vscode.commands.executeCommand(vscodeSettingsCommand, vscodeSettingsFilter)
    }
  )
  /** Register check configuration command */
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
  /** Register all commands with the extension context */
  context.subscriptions.push(
    openConfigCommand,
    checkConfigCommand,
    selectModelCommand,
    selectDatabaseCommand,
    testServiceCommand
  )
  StatusBarItem.getInstance().show(`$(lightbulb) ${configSection}: Ready!`)
}
