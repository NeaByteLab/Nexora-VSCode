import * as vscode from 'vscode'
import { GenerationResult, GhostTextData } from '@interfaces/index'
import { ErrorHandler } from '@utils/index'

/**
 * Ghost text manager for handling inline completion text tracking
 * @description Manages ghost text data and tracks completion acceptance state
 */
class GhostTextManager {
  /** The singleton instance of the GhostTextManager */
  private static instance: GhostTextManager | undefined
  /** The expected ghost text data for tracking completion state */
  private expectedGhostText: GhostTextData | null = null

  /**
   * Creates a new GhostTextManager instance
   * @description Private constructor for singleton pattern
   */
  private constructor() {
    this.expectedGhostText = null
  }

  /**
   * Gets the singleton instance of the GhostTextManager
   * @description Returns the existing instance or creates a new one if none exists
   * @returns The singleton instance of the GhostTextManager
   */
  public static getInstance(): GhostTextManager {
    GhostTextManager.instance ??= new GhostTextManager()
    return GhostTextManager.instance
  }

  /**
   * Sets the expected ghost text data for tracking completion acceptance
   * @description Calculates end position and stores ghost text data for the document
   * @param document - The document to set the expected ghost text data for
   * @param data - The generation result containing content and positioning information
   */
  public setExpectedGhostText(document: vscode.TextDocument, data: GenerationResult): void {
    try {
      const totalLine: string[] = data.content.split('\n')
      let endLine: number
      let endCharacter: number
      if (totalLine.length > 1) {
        endLine = data.lineStart + totalLine.length - 1
        endCharacter = totalLine[totalLine.length - 1]?.length ?? 0
      } else {
        endLine = data.lineStart
        endCharacter = data.charStart + data.content.length
      }
      this.expectedGhostText = {
        documentUri: document.uri.toString(),
        documentVersion: document.version,
        lineStart: data.lineStart,
        charStart: data.charStart,
        lineEnd: endLine,
        charEnd: endCharacter,
        content: data.content,
        title: data.title
      }
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'setExpectedGhostText', false, 'error')
    }
  }

  /**
   * Checks if the ghost text was accepted by comparing expected and actual content
   * @description Validates document version, position, and content to determine if completion was accepted
   * @param document - The document to check for ghost text acceptance
   * @param newPosition - The current cursor position in the document
   * @returns True if the ghost text was accepted, false otherwise
   */
  public checkGhostTextWasAccepted(
    document: vscode.TextDocument,
    newPosition: vscode.Position
  ): boolean {
    try {
      if (!this.expectedGhostText) {
        return false
      }
      if (this.expectedGhostText.documentUri !== document.uri.toString()) {
        return false
      }
      if (document.version <= this.expectedGhostText.documentVersion) {
        return false
      }
      const expectedEndPos: vscode.Position = new vscode.Position(
        this.expectedGhostText.lineEnd,
        this.expectedGhostText.charEnd
      )
      if (newPosition.isEqual(expectedEndPos)) {
        const startPos: vscode.Position = new vscode.Position(
          this.expectedGhostText.lineStart,
          this.expectedGhostText.charStart
        )
        const expectedText: string = this.expectedGhostText.content
        const actualRange: vscode.Range = new vscode.Range(startPos, expectedEndPos)
        const actualText: string = document.getText(actualRange)
        if (actualText === expectedText) {
          this.expectedGhostText = null
          return true
        }
      }
      return false
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'checkGhostTextWasAccepted', false, 'error')
      return false
    }
  }
}

/**
 * Exports the singleton instance of the GhostTextManager
 * @description Provides access to the global GhostTextManager instance
 */
export default GhostTextManager.getInstance()
