import * as vscode from 'vscode'
import { vscodeWhitelistExt } from '@constants/index'
import { InlineCompletionProvider, KeyboardBinding } from '@integrator/index'
import { OllamaService } from '@services/index'
import { ErrorHandler } from '@utils/index'

/**
 * Manages inline completion registration and file monitoring
 * @description Registers completion providers and handles file context for code suggestions
 */
export default class InlineCompletion {
  /** Extension context for managing subscriptions */
  private readonly context: vscode.ExtensionContext
  /** Inline suggestion service for code suggestions */
  private readonly inlineCompletionProvider: InlineCompletionProvider
  /** Keyboard binding service for suggestion actions */
  private readonly keyboardBinding: KeyboardBinding

  /**
   * Initializes a new InlineCompletion instance
   * @param ollamaService - Service instance for handling operations
   * @param context - Extension context for managing subscriptions
   */
  constructor(ollamaService: OllamaService, context: vscode.ExtensionContext) {
    this.context = context
    this.inlineCompletionProvider = new InlineCompletionProvider(ollamaService)
    this.keyboardBinding = new KeyboardBinding(context)
  }

  /**
   * Starts the completion API service
   * @description Registers inline completion providers for supported file types and sets up keyboard bindings
   * @returns void
   */
  public start(): void {
    try {
      this.keyboardBinding.setup()
      const completionDisposable: vscode.Disposable =
        vscode.languages.registerInlineCompletionItemProvider(
          {
            scheme: 'file',
            pattern: `**/*.{${vscodeWhitelistExt.join(',')}}`
          },
          this.inlineCompletionProvider
        )
      this.context.subscriptions.push(completionDisposable)
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'file listener initialization', true, 'error')
    }
  }
}
