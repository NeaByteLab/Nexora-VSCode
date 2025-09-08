import { z } from 'zod'
import * as vscode from 'vscode'
import { GenerationResult } from '@interfaces/index'
import { ContextBuilder, KeyboardBinding, StatusBarItem } from '@integrator/index'
import { OllamaService } from '@services/index'
import { generationSchema, generationFormat } from '@schemas/index'
import { ErrorHandler } from '@utils/index'

/**
 * Manages inline code suggestions using the editor's InlineCompletionItemProvider
 * @description Provides inline suggestions with keyboard shortcuts for code completion
 */
export default class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  /** Ollama service for AI generation */
  private readonly ollamaService: OllamaService
  /** Key binding API for suggestion actions */
  private readonly keyboardBinding: KeyboardBinding
  /** Status bar item for suggestion info */
  private readonly statusBarItem: StatusBarItem | undefined
  /** Ongoing AI generation request */
  private ollamaOngoing: Promise<GenerationResult | null> | null = null

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
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (!activeEditor || activeEditor.document.fileName !== document.fileName) {
        return null
      }
      if (
        context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic &&
        vscode.window.activeTextEditor &&
        !vscode.window.activeTextEditor.selection.isEmpty
      ) {
        console.log(
          '[DEBUG] provideInlineCompletionItems(): triggerKind is automatic and selection is not empty'
        )
        return null
      }
      if (token.isCancellationRequested || this.ollamaOngoing) {
        console.log(
          '[DEBUG] provideInlineCompletionItems(): token is cancellation requested or ollama is ongoing'
        )
        return null
      }
      this.statusBarItem?.show(
        '$(loading~spin) Generating code suggestion...',
        'Accept Suggestion (TAB)'
      )
      this.ollamaOngoing = this.generateCodeCompletion(document, position)
      const completionResult: GenerationResult | null = await this.ollamaOngoing
      if (!completionResult) {
        console.log('[DEBUG] provideInlineCompletionItems(): completionResult is null')
        return null
      }
      this.keyboardBinding.acceptSuggestion()
      console.log(`[DEBUG] Generated code suggestion:\n${JSON.stringify(completionResult)}`)
      return []
    } catch {
      console.log('[DEBUG] provideInlineCompletionItems(): error')
      this.statusBarItem?.hide()
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
        return (generationSchema as z.ZodSchema).parse(parsed) as GenerationResult
      }
      return null
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'code generation failed', true, 'error')
      return null
    } finally {
      this.ollamaOngoing = null
    }
  }

  /**
   * Clears the current suggestion from the editor and status bar
   * @description Removes suggestion state and hides status bar item
   */
  private clearSuggestion(): void {
    this.statusBarItem?.hide()
  }

  /**
   * Disposes the inline suggestion service and cleans up resources
   * @description Clears suggestions and disposes status bar item
   */
  public dispose(): void {
    this.clearSuggestion()
    this.statusBarItem?.dispose()
  }
}
