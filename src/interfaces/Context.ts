import * as vscode from 'vscode'

/**
 * File context data structure for document analysis
 * @description Contains file metadata and cursor position information for context-aware operations
 */
export interface FileContextData {
  /** File metadata and properties */
  fileData: {
    /** Complete absolute file path */
    filePath: string
    /** File name including extension */
    fileName: string
    /** File name without extension */
    fileNameWithoutExt: string
    /** File extension without the dot */
    fileExtension: string
    /** Language identifier used by the editor */
    fileLanguageId: string
    /** Total number of lines in the document */
    fileTotalLines: number
    /** Whether the file has unsaved changes */
    fileIsDirty: boolean
  }
  /** Cursor position and text selection data */
  selectedData: {
    /** Text content of the line where cursor is positioned */
    selectedLineText: string
    /** Line number where cursor is positioned (1-based indexing) */
    selectedLineNumber: number
    /** Character position within the current line (1-based indexing) */
    selectedCharacterPosition: number
    /** All text content before the cursor position */
    selectedTextBeforeCursor: string
    /** All text content after the cursor position */
    selectedTextAfterCursor: string
  }
}

/**
 * Represents a semantic token segment with text content and metadata
 * @description Contains the text content, semantic type, modifiers, and range of the token for syntax highlighting
 */
export type SemanticSegment = {
  /** The text content of the token */
  text: string
  /** The semantic type of the token */
  tokenType: string
  /** Array of semantic modifiers applied to the token */
  tokenModifiers: string[]
  /** The range position of the token in the document */
  range: vscode.Range
}
