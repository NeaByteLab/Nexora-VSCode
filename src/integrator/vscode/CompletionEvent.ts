import * as vscode from 'vscode'
import { vscodeWhitelistExt } from '@constants/index'
import { CompletionHandler, CompletionProvider, ErrorLense } from '@integrator/index'
import { LogHandler } from '@utils/index'

/**
 * Default document selector for inline completion.
 * @description Selects files with whitelisted extensions
 */
const defaultSelector: vscode.DocumentSelector = {
  scheme: 'file',
  pattern: `**/*.{${vscodeWhitelistExt.join(',')}}`
}

/**
 * Manages inline completion registration and file monitoring.
 * @description Registers completion providers and handles file context for code suggestions
 */
export default class CompletionEvent {
  /** Extension context for managing subscriptions */
  private readonly context: vscode.ExtensionContext

  /**
   * Initializes a new CompletionEvent instance.
   * @param context - Extension context for managing subscriptions
   */
  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  /**
   * Initializes the completion service and registers all required providers.
   * @description Registers command handlers, completion providers, and error lens for the extension
   */
  public initialize(): void {
    try {
      this.context.subscriptions.push(
        vscode.commands.registerCommand(
          'editor.action.inlineSuggest.dismiss',
          (source?: string) => {
            CompletionHandler.getInstance().handleDismiss(source ?? '')
          }
        ),
        vscode.commands.registerCommand('editor.action.inlineSuggest.commit', (source?: string) => {
          CompletionHandler.getInstance().handleCommit(source ?? '')
        }),
        vscode.commands.registerCommand('editor.action.inlineSuggest.acceptNextLine', () => {
          LogHandler.handleAcceptWarning()
        }),
        vscode.commands.registerCommand('editor.action.inlineSuggest.acceptNextWord', () => {
          LogHandler.handleAcceptWarning()
        })
      )
      this.context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(defaultSelector, CompletionHandler.getInstance()),
        vscode.languages.registerInlineCompletionItemProvider(
          defaultSelector,
          new CompletionProvider()
        )
      )
      new ErrorLense(this.context).initialize()
    } catch (error: unknown) {
      LogHandler.handle(error, 'completion event listener initialization', true, 'error')
    }
  }
}
