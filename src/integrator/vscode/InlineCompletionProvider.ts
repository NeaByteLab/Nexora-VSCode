import { z } from 'zod'
import * as vscode from 'vscode'
import { GenerationResult } from '@interfaces/index'
import { ContextBuilder, KeyboardBinding, StatusBarItem } from '@integrator/index'
import { OllamaService } from '@services/index'
import { generationSchema, generationFormat } from '@schemas/index'
import { configSection } from '@constants/index'

/**
 * Manages inline code suggestions using the editor's InlineCompletionItemProvider
 * @description Provides inline suggestions with keyboard shortcuts for code completion
 */
export default class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  /** Ollama service for AI generation */
  private readonly ollamaService: OllamaService
  /** Keyboard binding service for suggestion actions */
  private readonly keyboardBinding: KeyboardBinding
  /** Status bar item for suggestion info */
  private readonly statusBarItem: StatusBarItem | undefined
  /** Ongoing AI generation request */
  private ollamaOngoing: Promise<GenerationResult | null> | null = null
  /** Displayed completion */
  private ollamaOnreview: boolean = false

  /**
   * Initializes a new InlineCompletionProvider instance
   * @param ollamaService - Service instance for AI generation
   * @param context - Extension context for managing subscriptions
   */
  constructor(ollamaService: OllamaService, context: vscode.ExtensionContext) {
    this.ollamaService = ollamaService
    this.statusBarItem = new StatusBarItem()
    this.keyboardBinding = new KeyboardBinding(context)
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
      if (this.ollamaOnreview) {
        this.handleEvent('dismiss')
      }
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
      this.statusBarItem?.show('$(loading~spin) Generating Completion...')
      this.ollamaOngoing = this.generateCodeCompletion(document, position)
      const completionResult: GenerationResult | null = await this.ollamaOngoing
      console.log(`[DEBUG]\n${JSON.stringify(completionResult)}`)
      if (!completionResult || token.isCancellationRequested) {
        return null
      }
      this.statusBarItem?.show(`$(lightbulb) ${configSection}: ${completionResult.title}`)
      const completionItem: vscode.InlineCompletionItem = new vscode.InlineCompletionItem(
        typeof completionResult.content === 'string'
          ? completionResult.content
          : new vscode.SnippetString(completionResult.content),
        new vscode.Range(
          new vscode.Position(completionResult.lineStart - 1, completionResult.charStart),
          new vscode.Position(completionResult.lineEnd - 1, completionResult.charEnd)
        ),
        {
          title: '',
          command: `${configSection}.AcceptSuggestion`,
          arguments: [
            (): void => {
              this.handleEvent('accept', [completionItem])
            }
          ]
        }
      )
      this.handleEvent('show', [completionItem])
      return [completionItem]
    } catch {
      return null
    }
  }

  /**
   * Generates code completion using AI service for the given document and position
   * @param document - The text document to generate completion for
   * @param position - The cursor position in the document
   * @returns Generated completion result or null if generation failed
   */
  private async generateCodeCompletion(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<GenerationResult | null> {
    try {
      const context: string = ContextBuilder.getUserPrompt(document, position)
      const response: unknown = await this.ollamaService.generateCompletion(
        context,
        generationFormat
      )
      if (typeof response === 'object' && response !== null && 'message' in response) {
        const parsed: object = JSON.parse(
          (response as { message: { content: string } }).message.content
        ) as object
        const parseResponse: GenerationResult = (generationSchema as z.ZodSchema).parse(
          parsed
        ) as GenerationResult
        return parseResponse
      }
      return null
    } catch {
      return null
    } finally {
      this.ollamaOngoing = null
      this.statusBarItem?.hide()
    }
  }

  /**
   * Handles completion events and manages state
   * @param event - The event type to handle
   * @param completions - Optional array of completion items for accept events
   * @description Manages completion state transitions and caching for different event types
   */
  private handleEvent(
    event: 'show' | 'accept' | 'dismiss' | 'accept_word' | 'accept_line',
    completions?: vscode.InlineCompletionItem[]
  ): void {
    if (event === 'accept' && completions) {
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (!activeEditor) {
        return
      }
      const completionItem: vscode.InlineCompletionItem =
        completions[0] as unknown as vscode.InlineCompletionItem
      const insertText: string =
        typeof completionItem.insertText === 'string'
          ? completionItem.insertText
          : completionItem.insertText?.value || ''
      const contentLength: number = insertText.split('\n').length - 1
      const editorDocument: vscode.Uri = activeEditor.document.uri
      if (!completionItem.range) {
        return
      }
      const editorRange: vscode.Range = new vscode.Range(
        new vscode.Position(completionItem.range.start.line, completionItem.range.start.character),
        new vscode.Position(
          completionItem.range.end.line + contentLength,
          completionItem.range.end.character
        )
      )
      this.keyboardBinding.acceptSuggestion(editorDocument, editorRange)
      this.ollamaOnreview = true
    } else if (this.ollamaOnreview) {
      this.ollamaOnreview = false
    }
  }

  /**
   * Disposes the inline suggestion service and cleans up resources
   * @description Clears suggestions and disposes status bar item
   */
  public dispose(): void {
    this.statusBarItem?.dispose()
  }
}
