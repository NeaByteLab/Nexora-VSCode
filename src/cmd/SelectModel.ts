import * as vscode from 'vscode'
import ConfigManager from '@config/ConfigManager'
import OllamaService from '@services/OllamaService'
import ErrorHandler from '@utils/ErrorHandler'

/**
 * Provides model selection interface for users
 * Shows available models and allows selection through VSCode quick pick
 * @param ollamaService - Ollama service instance for retrieving available models
 */
export default async function (ollamaService: OllamaService): Promise<void> {
  try {
    const models: string[] = await ollamaService.getModels()
    if (models.length === 0) {
      vscode.window.showWarningMessage('No models available. Please check your Ollama connection.')
      return
    }
    const currentModel: string = ConfigManager.getSelectedModel()
    if (
      (!currentModel || !models.includes(currentModel)) &&
      models.length > 0 &&
      models[0] !== undefined &&
      models[0] !== ''
    ) {
      const firstModel: string = models[0]
      await ConfigManager.setSelectedModel(firstModel)
      vscode.window.showInformationMessage(`Auto-selected first available model: ${firstModel}`)
      return
    }
    const quickPick: vscode.QuickPickItem[] = models.map((model: string) => {
      if (model === currentModel) {
        return {
          label: model,
          description: '(Currently selected)',
          picked: true
        }
      }
      return {
        label: model,
        picked: false
      }
    })
    const selectedItem: vscode.QuickPickItem | undefined = await vscode.window.showQuickPick(
      quickPick,
      {
        placeHolder: 'Select an Ollama model for code completion',
        canPickMany: false
      }
    )
    if (selectedItem) {
      await ConfigManager.setSelectedModel(selectedItem.label)
      vscode.window.showInformationMessage(`Selected model: ${selectedItem.label}`)
    }
  } catch (error: unknown) {
    ErrorHandler.handle(error, 'model selection', true, 'error')
  }
}
