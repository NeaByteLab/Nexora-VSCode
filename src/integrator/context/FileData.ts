import * as vscode from 'vscode'
import { FileContextData } from '@interfaces/index'

/**
 * Extracts file and cursor context data from a text document.
 * Returns file information and text selection details.
 *
 * @param document - The text document to analyze
 * @param position - The cursor position within the document
 * @returns Object containing file metadata and selected text context
 */
export default function (
  document: vscode.TextDocument,
  position: vscode.Position
): FileContextData {
  const filePath: string = document.fileName
  const fileName: string = filePath.split('/').pop() ?? ''
  const fileTotalLines: number = document.lineCount
  const selectedLineText: string = document.lineAt(position.line).text
  return {
    fileData: {
      filePath,
      fileName,
      fileLanguageId: document.languageId,
      fileTotalLines,
      fileContent: document.getText(),
      fileIsDirty: document.isDirty
    },
    selectedData: {
      selectedLineText,
      selectedLineNumber: position.line + 1,
      selectedCharacterPosition: position.character + 1,
      selectedTextBeforeCursor: document.getText(
        new vscode.Range(new vscode.Position(0, 0), position)
      ),
      selectedTextAfterCursor: document.getText(
        new vscode.Range(
          position,
          new vscode.Position(fileTotalLines - 1, document.lineAt(fileTotalLines - 1).text.length)
        )
      )
    }
  }
}
