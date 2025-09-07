import * as vscode from 'vscode'
import { ConfigurationData } from '@interfaces/index'
import ConfigManager from '@config/ConfigManager'
import OllamaService from '@services/OllamaService'
import ErrorHandler from '@utils/ErrorHandler'

/** Constants */
const vscodeSettingsCommand: string = 'workbench.action.openSettings'
const vscodeSettingsFilter: string = 'nexora-vscode'
const vscodeSettingsButton: string = 'Open Settings'

/**
 * Validates configuration and checks service availability
 * Shows configuration status and available models to the user
 * @param ollamaService - Ollama service instance for model validation
 */
export default async function (ollamaService: OllamaService): Promise<void> {
  try {
    const config: ConfigurationData = ConfigManager.getConfig()
    const ollamaAvailable: string[] = await ollamaService.getModels()
    await vscode.commands.executeCommand(vscodeSettingsCommand, vscodeSettingsFilter)
    if (ollamaAvailable.length === 0) {
      vscode.window
        .showWarningMessage(
          `Ollama not available at ${config.host}. Please check your settings.`,
          vscodeSettingsButton
        )
        .then((selection: string | undefined) => {
          if (selection === vscodeSettingsButton) {
            vscode.commands.executeCommand(vscodeSettingsCommand, vscodeSettingsFilter)
          }
        })
    }
    const modelStatus: string = config.selectedModel
      ? `Model: ${config.selectedModel}`
      : 'Model: Not selected'
    vscode.window
      .showInformationMessage(
        'Nexora VSCode configured successfully!\n' +
          `Host: ${config.host}\n` +
          `Database: ${config.databasePath}\n` +
          `Ollama: Connected (${ollamaAvailable.length} models)\n${modelStatus}`,
        vscodeSettingsButton,
        'Select Model'
      )
      .then((selection: string | undefined) => {
        if (selection === vscodeSettingsButton) {
          vscode.commands.executeCommand(vscodeSettingsCommand, vscodeSettingsFilter)
        } else if (selection === 'Select Model') {
          vscode.commands.executeCommand('nexora-vscode.selectModel')
        }
      })
  } catch (error: unknown) {
    ErrorHandler.handle(error, 'configuration check', true, 'error')
  }
}
