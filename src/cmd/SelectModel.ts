import * as vscode from 'vscode'
import { ConfigManager } from '@config/index'
import { OllamaService } from '@services/index'
import { ErrorHandler } from '@utils/index'

/**
 * Global state variables
 */
let selectedModel: string = ''
let listModels: string[] = []

/**
 * Displays model selection interface to users
 * Shows available models and allows selection through quick pick interface
 * Automatically selects first model if none is currently selected
 * @param ollamaService - Service instance for retrieving available models
 */
export default async function (ollamaService: OllamaService): Promise<void> {
  try {
    listModels = await ollamaService.getModels()
    selectedModel = ConfigManager.getSelectedModel()
    if (
      (!selectedModel || !listModels.includes(selectedModel)) &&
      listModels.length > 0 &&
      listModels[0] !== undefined &&
      listModels[0] !== ''
    ) {
      const firstModel: string = listModels[0]
      await ConfigManager.setSelectedModel(firstModel)
      selectedModel = ConfigManager.getSelectedModel()
    }
    const quickPick: vscode.QuickPickItem[] = listModels.map((model: string) => {
      if (model === selectedModel) {
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
        placeHolder: 'Select a model for code completion',
        canPickMany: false
      }
    )
    if (selectedItem) {
      await ConfigManager.setSelectedModel(selectedItem.label)
    }
  } catch (error: unknown) {
    ErrorHandler.handle(error, 'model selection', true, 'error')
  }
}
