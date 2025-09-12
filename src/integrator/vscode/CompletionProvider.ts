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
 * @description Provides inline suggestions with keyboard shortcuts for code completion.
 * Only handles 'add' operations - other operations (edit, delete, none) are managed by CompletionHandler.ts
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
   * @description Creates a new completion provider with service instances
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
      const previousResult: FileTrackerData | null = this.handleSessionCompletion(
        document,
        context,
        token
      )
      if (previousResult) {
        if (previousResult.type === 'add') {
          return [new vscode.InlineCompletionItem(previousResult.newContent)]
        }
        return []
      }
      this.statusBarItem.show('$(loading~spin) Generating Completion...')
      this.ollamaOngoing = requestInlineCompletion(document, position, this.ollamaService)
      const completionResult: GenerationResult | null = await this.ollamaOngoing
      if (!completionResult) {
        this.statusBarItem.show(`$(close) ${configSection}: Invalid response format`)
        return []
      }
      this.statusBarItem.show(`$(lightbulb) ${configSection}: ${completionResult.title}`)
      CompletionDiff.getInstance().process(document, completionResult)
      const fileTrackerData: FileTrackerData = FileTracker.getInstance().get(
        document.uri.toString()
      )
      if (fileTrackerData.type === 'add') {
        return [new vscode.InlineCompletionItem(fileTrackerData.newContent)]
      } else {
        vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri)
      }
      return []
    } catch (error: unknown) {
      this.statusBarItem.show(`$(error) ${configSection}: Completion failed`)
      LogHandler.handle(error, 'provideInlineCompletionItems', false, 'error')
      return []
    } finally {
      this.ollamaOngoing = null
    }
  }

  /**
   * Validates completion session conditions and determines if completion should proceed.
   * @description Checks if completion should be triggered based on editor state and existing completion data
   * @param document - The text document where completion is being requested
   * @param context - The completion context containing trigger information
   * @param token - Cancellation token for the completion operation
   * @returns File tracker data if completion should proceed, null if should be skipped
   */
  private handleSessionCompletion(
    document: vscode.TextDocument,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): FileTrackerData | null {
    try {
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (!activeEditor || activeEditor.document.fileName !== document.fileName) {
        return null
      }
      if (
        context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic &&
        vscode.window.activeTextEditor &&
        !vscode.window.activeTextEditor.selection.isEmpty
      ) {
        return null
      }
      if (token.isCancellationRequested || this.ollamaOngoing) {
        return null
      }
      const fileTrackerData: FileTrackerData = FileTracker.getInstance().get(
        document.uri.toString()
      )
      if (fileTrackerData.fileState === 'pending') {
        if (fileTrackerData.type === 'none') {
          return null
        }
        this.statusBarItem.show(`$(lightbulb) ${configSection}: ${fileTrackerData.title}`)
        return fileTrackerData
      }
      return null
    } catch (error: unknown) {
      LogHandler.handle(error, 'handleSessionCompletion', false, 'error')
      this.statusBarItem.show(`$(error) ${configSection}: Session validation failed`)
      return null
    }
  }
}
