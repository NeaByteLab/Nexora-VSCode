import * as vscode from 'vscode'
import { GenerationResult } from '@interfaces/index'
import { requestInlineCompletion, StatusBarItem } from '@integrator/index'
import { OllamaService } from '@services/index'
import { configSection } from '@constants/index'
import { ErrorHandler } from '@utils/index'

/**
 * Manages inline code suggestions using the editor's InlineCompletionItemProvider
 * @description Provides inline suggestions with keyboard shortcuts for code completion
 */
export default class CompletionProvider implements vscode.InlineCompletionItemProvider {
  /** Ollama service for AI generation */
  private readonly ollamaService: OllamaService
  /** Status bar item for suggestion info (singleton instance) */
  private readonly statusBarItem: StatusBarItem
  /** Ongoing AI generation request */
  private ollamaOngoing: Promise<GenerationResult | null> | null = null

  /**
   * Initializes a new InlineCompletionProvider instance
   * @param context - Extension context for managing subscriptions
   */
  constructor(context: vscode.ExtensionContext) {
    this.ollamaService = new OllamaService()
    this.statusBarItem = StatusBarItem.getInstance()
    this.setupEventListeners(context)
  }

  /**
   * Sets up event listeners for completion interactions
   * @param context - Extension context for managing subscriptions
   */
  private setupEventListeners(context: vscode.ExtensionContext): void {
    const selectionChangeDisposable: vscode.Disposable =
      vscode.window.onDidChangeTextEditorSelection(() => {
        if (this.ollamaOngoing) {
          this.ollamaOngoing = null
        }
      })
    const documentChangeDisposable: vscode.Disposable = vscode.workspace.onDidChangeTextDocument(
      (event: vscode.TextDocumentChangeEvent) => {
        if (event.contentChanges.length > 0 && this.ollamaOngoing) {
          this.ollamaOngoing = null
        }
      }
    )
    context.subscriptions.push(selectionChangeDisposable, documentChangeDisposable)
  }

  /**
   * Provides inline completion items for the given position
   * @param document - The document in which the command was invoked
   * @param position - The position at which the command was invoked
   * @param context - Additional context about the completion
   * @param token - A cancellation token
   * @returns Array of completion items or null if no suggestion available
   */
  public async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[] | null> {
    try {
      this.handleSessionCompletion(document, context, token)
      this.statusBarItem.show('$(loading~spin) Generating Completion...')
      this.ollamaOngoing = requestInlineCompletion(
        document,
        position,
        this.ollamaService,
        this.statusBarItem
      )
      const completionResult: GenerationResult | null = await this.ollamaOngoing
      if (!completionResult || token.isCancellationRequested) {
        return null
      }
      console.log(
        '[DEBUG] provideInlineCompletionItems @ completionResult:\n',
        JSON.stringify(completionResult, null, 2)
      )
      this.statusBarItem.show(`$(lightbulb) ${configSection}: ${completionResult.title}`)
      const completionText: string | vscode.SnippetString =
        typeof completionResult.content === 'string'
          ? completionResult.content
          : new vscode.SnippetString(completionResult.content)
      const completionRange: vscode.Range = new vscode.Range(
        new vscode.Position(completionResult.lineStart - 1, completionResult.charStart),
        new vscode.Position(completionResult.lineEnd - 1, completionResult.charEnd)
      )
      console.log(
        '[DEBUG] provideInlineCompletionItems @ document:\n',
        JSON.stringify(document, null, 2)
      )
      const completionItem: vscode.InlineCompletionItem = new vscode.InlineCompletionItem(
        completionText,
        completionRange,
        {
          title: 'Accept suggestion',
          command: `${configSection}.AcceptSuggestion`,
          arguments: [document.uri, completionRange, 'completion']
        }
      )
      return [completionItem]
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'provideInlineCompletionItems', false)
      return null
    } finally {
      this.ollamaOngoing = null
    }
  }

  /**
   * Validates completion session conditions and handles early returns
   * @param document - The text document for completion
   * @param context - The completion context information
   * @param token - The cancellation token for the operation
   * @returns null if completion should be skipped, undefined if validation passes
   */
  private handleSessionCompletion(
    document: vscode.TextDocument,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): void | null {
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
  }
}
