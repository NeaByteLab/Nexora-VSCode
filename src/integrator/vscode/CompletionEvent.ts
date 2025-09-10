import * as vscode from 'vscode'
import { vscodeWhitelistExt } from '@constants/index'
import { KeyboardBinding, CompletionProvider, CodeActionLint } from '@integrator/index'
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
  /** Code action provider for lint fixes */
  private readonly codeActionLint: CodeActionLint

  /**
   * Initializes a new CompletionEvent instance
   * @param context - Extension context for managing subscriptions
   */
  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.completionProvider = new CompletionProvider(context)
    this.keyboardBinding = new KeyboardBinding(context)
    this.codeActionLint = new CodeActionLint(context)
  }

  /**
   * Initializes the completion service by registering providers and keyboard bindings
   */
  public initialize(): void {
    try {
      this.keyboardBinding?.initialize()
      const codeActionDisposable: vscode.Disposable = vscode.languages.registerCodeActionsProvider(
        {
          scheme: 'file',
          pattern: `**/*.{${vscodeWhitelistExt.join(',')}}`
        },
        this.codeActionLint
      )
      const completionDisposable: vscode.Disposable =
        vscode.languages.registerInlineCompletionItemProvider(
          {
            scheme: 'file',
            pattern: `**/*.{${vscodeWhitelistExt.join(',')}}`
          },
          this.completionProvider
        )
      this.context.subscriptions.push(completionDisposable, codeActionDisposable)
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'completion event listener initialization', true, 'error')
    }
  }
}
