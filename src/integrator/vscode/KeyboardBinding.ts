import * as vscode from 'vscode'
import { CompletionType } from '@interfaces/index'
import { ErrorHandler } from '@utils/index'
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
  }

  /**
   * Registers keyboard shortcuts for suggestion actions
   */
  public initialize(): void {
    const acceptCtrlCommand: vscode.Disposable = vscode.commands.registerCommand(
      `${configSection}.AcceptSuggestion`,
      (docUri: vscode.Uri, docRange: vscode.Range, docType: CompletionType) => {
        this.acceptSuggestion(docUri, docRange, docType)
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
   * @param docUri - The document URI where completion was applied
   * @param docRange - The range where completion was applied
   * @param docType - The type of completion being accepted
   */
  public acceptSuggestion(
    docUri: vscode.Uri,
    docRange: vscode.Range,
    docType: CompletionType
  ): void {
    void this.appliedCompletion(docUri, docRange, docType)
  }

  /**
   * Rejects the current suggestion and clears it from the editor
   */
  public rejectSuggestion(): void {
    console.log('[DEBUG] rejectSuggestion')
    vscode.commands.executeCommand('editor.action.inlineSuggest.dismiss')
  }

  /**
   * Applies code actions after completion acceptance
   * @param docUri - The document URI where completion was applied
   * @param docRange - The range where completion was applied
   * @param docType - The type of completion being processed
   * @returns Promise that resolves when code actions are processed
   */
  private async appliedCompletion(
    docUri: vscode.Uri,
    docRange: vscode.Range,
    docType: CompletionType
  ): Promise<void> {
    try {
      console.log('[DEBUG] appliedCompletion: ', docUri, docType)
      if (docType === 'completion') {
        vscode.commands.executeCommand('editor.action.inlineSuggest.commit')
      } else if (docType === 'action') {
        const codeActions: vscode.CodeAction[] = await vscode.commands.executeCommand<
          vscode.CodeAction[]
        >('vscode.executeCodeActionProvider', docUri, docRange)
        const quickFixActions: vscode.CodeAction[] = codeActions.filter(
          (action: vscode.CodeAction) =>
            (action.kind?.contains(vscode.CodeActionKind.QuickFix) ?? false) &&
            action.title.toLowerCase().includes('import')
        )
        if (quickFixActions.length === 1 && quickFixActions[0]) {
          const firstAction: vscode.CodeAction = quickFixActions[0]
          if (firstAction.edit) {
            await vscode.workspace.applyEdit(firstAction.edit)
          }
          if (firstAction.command) {
            await vscode.commands.executeCommand(
              firstAction.command.command,
              firstAction.command.arguments
            )
          }
        }
      } else {
        throw new Error('Invalid completion type')
      }
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'appliedCompletion', false)
    }
  }
}
