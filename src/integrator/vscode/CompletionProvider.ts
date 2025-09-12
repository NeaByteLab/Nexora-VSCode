import * as vscode from 'vscode'
import { GenerationResult, FileTrackerData } from '@interfaces/index'
import {
  requestInlineCompletion,
  CompletionDiff,
  StatusBarItem,
  FileTracker
} from '@integrator/index'
import { OllamaService } from '@services/index'
import { configSection } from '@constants/index'
import { LogHandler } from '@utils/index'

/**
 * Manages inline code suggestions using the editor's InlineCompletionItemProvider.
 * @description Provides inline suggestions with keyboard shortcuts for code completion
 */
export default class CompletionProvider implements vscode.InlineCompletionItemProvider {
  /** Ollama service instance for text generation requests */
  private readonly ollamaService: OllamaService
  /** Status bar item instance for displaying completion information */
  private readonly statusBarItem: StatusBarItem
  /** Currently active generation request promise or null if no request is pending */
  private ollamaOngoing: Promise<GenerationResult | null> | null = null

  /**
   * Initializes a new CompletionProvider instance.
   * @param context - Extension context for managing subscriptions and lifecycle
   */
  constructor() {
    this.ollamaService = new OllamaService()
    this.statusBarItem = StatusBarItem.getInstance()
  }

  /**
   * Provides inline completion items for the given position in the document.
   * @param document - The text document where completion is requested
   * @param position - The cursor position where completion should be provided
   * @param context - Additional context about the completion trigger
   * @param token - Cancellation token for aborting the operation
   * @returns Promise resolving to completion items array or null if no suggestions available
   */
  public async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[]> {
    try {
      const previousResult: vscode.InlineCompletionItem[] = this.handleSessionCompletion(
        document,
        context,
        token
      )
      if (previousResult.length > 0) {
        return previousResult
      }
      this.statusBarItem.show('$(loading~spin) Generating Completion...')
      this.ollamaOngoing = requestInlineCompletion(document, position, this.ollamaService)
      const completionResult: GenerationResult | null = await this.ollamaOngoing
      if (!completionResult) {
        this.statusBarItem.show(`$(close) ${configSection}: Wrong Format`)
        return []
      }
      this.statusBarItem.show(`$(lightbulb) ${configSection}: ${completionResult.title}`)
      CompletionDiff.getInstance().process(document, completionResult)
      const fileTrackerData: FileTrackerData = FileTracker.getInstance().get(
        document.uri.toString()
      )
      if (fileTrackerData.type === 'add') {
        return [new vscode.InlineCompletionItem(fileTrackerData.newContent)]
      } else if (fileTrackerData.type === 'edit') {
        return []
      }
      return []
    } catch (error: unknown) {
      LogHandler.handle(error, 'provideInlineCompletionItems', false, 'error')
      return []
    } finally {
      this.ollamaOngoing = null
    }
  }

  /**
   * Validates completion session conditions and determines if completion should proceed.
   * @param document - The text document where completion is being requested
   * @param context - The completion context containing trigger information
   * @param token - Cancellation token for the completion operation
   * @returns null if completion should be skipped, undefined if validation passes
   */
  private handleSessionCompletion(
    document: vscode.TextDocument,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): vscode.InlineCompletionItem[] {
    try {
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (!activeEditor || activeEditor.document.fileName !== document.fileName) {
        return []
      }
      if (
        context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic &&
        vscode.window.activeTextEditor &&
        !vscode.window.activeTextEditor.selection.isEmpty
      ) {
        return []
      }
      if (token.isCancellationRequested || this.ollamaOngoing) {
        return []
      }
      const fileTrackerData: FileTrackerData = FileTracker.getInstance().get(
        document.uri.toString()
      )
      if (fileTrackerData.fileState === 'pending') {
        if (fileTrackerData.type === 'none' || fileTrackerData.newContent === 'none') {
          return []
        }
        this.statusBarItem.show(`$(lightbulb) ${configSection}: ${fileTrackerData.title}`)
        const itemCompletion: vscode.InlineCompletionItem = new vscode.InlineCompletionItem(
          fileTrackerData.newContent
        )
        return [itemCompletion]
      }
      return []
    } catch (error: unknown) {
      LogHandler.handle(error, 'handleSessionCompletion', false, 'error')
      return []
    }
  }
}
