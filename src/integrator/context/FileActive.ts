import * as vscode from 'vscode'
import { type SemanticSegment } from '@interfaces/index'
import { SemanticToken } from '@integrator/context/index'
import { ErrorHandler } from '@utils/index'

/**
 * Retrieves semantic tokens for the entire document in the editor.
 * This function gets semantic information about all code elements in the
 * document and logs the semantic tokens for debugging purposes.
 *
 * @param editor - The text editor containing the document
 * @returns Promise that resolves when the operation completes
 */
export default async function (editor: vscode.TextEditor): Promise<void> {
  try {
    const getSemanticTokens: vscode.ProviderResult<vscode.SemanticTokens> =
      await SemanticToken.getFullDocument(editor)
    console.log('[DEBUG] Full semantic tokens:', getSemanticTokens)
    if (getSemanticTokens) {
      const decodedTokens: Array<SemanticSegment> = SemanticToken.decodeTokens(
        getSemanticTokens,
        editor.document
      )
      console.log('[DEBUG] Decoded tokens:', decodedTokens)
      console.log('[DEBUG] Formatted tokens:', SemanticToken.formatTokens(decodedTokens))
    }
  } catch (error) {
    ErrorHandler.handle(error, 'FileActive', false)
  }
}
