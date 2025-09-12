import * as vscode from 'vscode'
import { GenerationResult, FileTrackerData } from '@interfaces/index'
import { FileTracker } from '@integrator/index'
import { LogHandler } from '@utils/index'

/**
 * Manages the computation of diff between current and proposed content.
 * @description Processes completion results and tracks file changes for completion suggestions
 */
export default class CompletionDiff {
  /** Singleton instance of the completion diff manager */
  private static instance: CompletionDiff | null = null

  /**
   * Private constructor prevents direct instantiation.
   * @description Enforces singleton pattern by making constructor private
   */
  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Returns the singleton instance of CompletionDiff.
   * @description Creates a new instance if none exists, otherwise returns the existing instance
   * @returns The shared CompletionDiff instance
   */
  public static getInstance(): CompletionDiff {
    CompletionDiff.instance ??= new CompletionDiff()
    return CompletionDiff.instance
  }

  /**
   * Processes the completion result and stores it in the file tracker.
   * @param document - The text document where completion is being applied
   * @param result - The generation result containing completion content and positioning
   * @description Converts the generation result to file tracker format and stores it for tracking
   */
  public process(document: vscode.TextDocument, result: GenerationResult): void {
    try {
      FileTracker.getInstance().set(this.getCompletionFormat(document, result))
    } catch (error: unknown) {
      LogHandler.handle(error, 'completion diff', false, 'error')
    }
  }

  /**
   * Converts generation result to file tracker data format.
   * @param document - The text document where completion is being applied
   * @param result - The generation result containing completion content and positioning
   * @returns File tracker data with completion information and file metadata
   * @description Creates file tracker data by combining generation result with document information
   */
  private getCompletionFormat(
    document: vscode.TextDocument,
    result: GenerationResult
  ): FileTrackerData {
    return {
      resTitle: result.title,
      fileUri: document.uri.toString(),
      fileLang: document.languageId,
      fileVersion: document.version,
      fileState: 'pending',
      ...result
    }
  }
}
