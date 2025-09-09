import * as vscode from 'vscode'
import { SemanticToken } from '@integrator/context/index'
import { ErrorHandler } from '@utils/index'

/**
 * Retrieves semantic tokens for the currently selected text in the editor.
 * This function gets semantic information about the selected range and logs
 * the selection details and semantic tokens for debugging purposes.
 *
 * @param editor - The text editor containing the selection
 * @returns Promise that resolves when the operation completes
 */
export default async function (editor: vscode.TextEditor): Promise<void> {
  try {
    const getSemanticTokens: vscode.ProviderResult<vscode.SemanticTokens> =
      await SemanticToken.getRangeDocument(editor, editor.selection)
    if (getSemanticTokens) {
      console.log('[DEBUG] Selection:', editor.selection)
      console.log('[DEBUG] Range semantic tokens:', getSemanticTokens)
    }
  } catch (error) {
    ErrorHandler.handle(error, 'FileSelection', false)
  }
}
