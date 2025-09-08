import * as vscode from 'vscode'
import { configSection } from '@constants/index'

/**
 * Manages keyboard shortcuts for suggestion actions
 * @description Provides methods to accept and reject suggestions
 */
export default class KeyboardBinding {
  /** Extension context for managing command subscriptions */
  private readonly context: vscode.ExtensionContext

  /**
   * Initializes a new KeyboardBinding instance
   * @param context - Extension context for managing command subscriptions
   */
  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.setup()
  }

  /**
   * Registers keyboard shortcuts for suggestion actions
   */
  public setup(): void {
    const acceptCtrlCommand: vscode.Disposable = vscode.commands.registerCommand(
      `${configSection}.AcceptSuggestion`,
      () => {
        this.acceptSuggestion()
      }
    )
    const rejectCtrlCommand: vscode.Disposable = vscode.commands.registerCommand(
      `${configSection}.RejectSuggestion`,
      () => {
        this.rejectSuggestion()
      }
    )
    this.context.subscriptions.push(acceptCtrlCommand, rejectCtrlCommand)
  }

  /**
   * Accepts the current suggestion and applies it to the editor
   * @description Commits the active suggestion to the document
   */
  public acceptSuggestion(): void {
    vscode.commands.executeCommand('editor.action.inlineSuggest.commit')
  }

  /**
   * Rejects the current suggestion and clears it from the editor
   * @description Dismisses the active suggestion without applying changes
   */
  public rejectSuggestion(): void {
    vscode.commands.executeCommand('editor.action.inlineSuggest.dismiss')
  }
}
