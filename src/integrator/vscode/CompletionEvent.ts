import * as vscode from 'vscode'
import { vscodeWhitelistExt } from '@constants/index'
import { KeyboardBinding, CompletionProvider } from '@integrator/index'
import { ErrorHandler } from '@utils/index'

/**
 * Manages inline completion registration and file monitoring
 * @description Registers completion providers and handles file context for code suggestions
 */
export default class CompletionEvent {
  /** Extension context for managing subscriptions */
  private readonly context: vscode.ExtensionContext
  /** Inline suggestion service for code suggestions */
  private readonly completionProvider: CompletionProvider
  /** Keyboard binding service for suggestion actions */
  private readonly keyboardBinding: KeyboardBinding

  /**
   * Initializes a new CompletionEvent instance
   * @param context - Extension context for managing subscriptions
   */
  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.completionProvider = new CompletionProvider(context)
    this.keyboardBinding = new KeyboardBinding(context)
  }

  /**
   * Initializes the completion service by registering providers and keyboard bindings
   */
  public initialize(): void {
    try {
      this.keyboardBinding?.initialize()
      const completionDisposable: vscode.Disposable =
        vscode.languages.registerInlineCompletionItemProvider(
          {
            scheme: 'file',
            pattern: `**/*.{${vscodeWhitelistExt.join(',')}}`
          },
          this.completionProvider
        )
      this.context.subscriptions.push(completionDisposable)
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'completion listener initialization', true, 'error')
    }
  }
}
