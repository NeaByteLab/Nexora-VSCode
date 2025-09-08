import * as vscode from 'vscode'
import { GenerationResult } from '@interfaces/index'
import { CacheManager } from '@integrator/index'
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
    const ollamaContent: GenerationResult | null = CacheManager.get(
      'CompletionAccept'
    ) as GenerationResult | null
    if (ollamaContent) {
      CacheManager.set('CompletionAccept', null)
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (!activeEditor) {
        return
      }
      const contentLength: number = ollamaContent.content.split('\n').length - 1
      const editorDocument: vscode.Uri = activeEditor.document.uri
      const editorRange: vscode.Range = new vscode.Range(
        new vscode.Position(ollamaContent.lineStart, ollamaContent.charStart),
        new vscode.Position(ollamaContent.lineEnd + contentLength, ollamaContent.charEnd)
      )
      void this.appliedCompletion(editorDocument, editorRange)
    }
    vscode.commands.executeCommand('editor.action.inlineSuggest.commit')
  }

  /**
   * Rejects the current suggestion and clears it from the editor
   * @description Dismisses the active suggestion without applying changes
   */
  public rejectSuggestion(): void {
    vscode.commands.executeCommand('editor.action.inlineSuggest.dismiss')
  }

  /**
   * Applies code actions after completion acceptance
   * @param docUri - The document URI where completion was applied
   * @param docRange - The range where completion was applied
   * @description Executes quick fix actions like import statements after completion is applied
   * @returns Promise that resolves when code actions are processed
   */
  private async appliedCompletion(docUri: vscode.Uri, docRange: vscode.Range): Promise<void> {
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
      try {
        if (firstAction.edit) {
          await vscode.workspace.applyEdit(firstAction.edit)
        }
        if (firstAction.command) {
          await vscode.commands.executeCommand(
            firstAction.command.command,
            firstAction.command.arguments
          )
        }
      } catch (error: unknown) {
        ErrorHandler.handle(error, 'applied completion', true, 'error')
      }
    }
  }
}
