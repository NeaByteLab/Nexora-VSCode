import * as vscode from 'vscode'
import { ConfigurationData } from '@interfaces/index'
import { ConfigManager } from '@config/index'
import { OllamaService } from '@services/index'
import { ErrorHandler, Validator } from '@utils/index'
import { vscodeSettingsCommand, vscodeSettingsFilter, vscodeSettingsButton } from '@constants/index'

/**
 * Validates configuration settings and checks service availability
 * Displays configuration status and available models to the user
 * @param ollamaService - Service instance for model validation
 */
export default async function (ollamaService: OllamaService): Promise<void> {
  try {
    const config: ConfigurationData = ConfigManager.getConfig()
    if (Validator.isOllamaUrl(config.host) && !Validator.isValidPath(config.databasePath)) {
      vscode.window.showWarningMessage(
        `Invalid database path: ${config.databasePath}.`,
        vscodeSettingsButton
      )
      await openSettings()
      return
    }
    const ollamaAvailable: string[] = await ollamaService.getModels()
    if (ollamaAvailable.length === 0) {
      await openSettings()
      return
    }
    vscode.window.showInformationMessage('All configurations are valid, extension is ready to use!')
  } catch (error: unknown) {
    ErrorHandler.handle(error, 'configuration check', true, 'error')
    await openSettings()
  }
}

/**
 * Opens VSCode settings with the extension filter applied
 * Navigates user to extension configuration page
 */
async function openSettings(): Promise<void> {
  await vscode.commands.executeCommand(vscodeSettingsCommand, vscodeSettingsFilter)
}
