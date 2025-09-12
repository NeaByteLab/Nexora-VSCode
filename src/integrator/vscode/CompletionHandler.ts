import * as vscode from 'vscode'
import { FileTrackerData } from '@interfaces/index'
import { FileTracker, StatusBarItem } from '@integrator/index'

/**
 * Handles completion events and provides code lens functionality.
 * @description Manages completion commit/dismiss actions and provides code lenses for completion suggestions
 */
export default class CompletionHandler implements vscode.CodeLensProvider {
  /** Singleton instance of the completion handler */
  private static instance: CompletionHandler | null = null
  /** Current file source URI for tracking completion state */
  private static fileSource: string | undefined = undefined
  /** Array of code lenses to display */
  private readonly codeLenses: vscode.CodeLens[] = []

  /**
   * Private constructor for singleton pattern.
   * @description Initializes the completion handler and sets the current file source
   */
  private constructor() {
    CompletionHandler.fileSource = vscode.window.activeTextEditor?.document.uri.toString()
  }

  /**
   * Provides code lenses for the given document.
   * @param document - The text document to provide code lenses for
   * @param token - Cancellation token for aborting the operation
   * @returns Promise resolving to code lenses array or null if no lenses available
   */
  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    console.log('provideCodeLenses', document, token)
    return this.codeLenses
  }

  /**
   * Resolves a code lens for the given code lens.
   * @param codeLens - The code lens to resolve
   * @param token - Cancellation token for aborting the operation
   * @returns Promise resolving to code lens or null if no lens available
   */
  resolveCodeLens?(
    codeLens: vscode.CodeLens,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens> {
    console.log('resolveCodeLens', token)
    return codeLens
  }

  /**
   * Gets the singleton instance of the completion handler.
   * @description Creates a new instance if none exists, otherwise returns the existing instance
   * @returns The singleton CompletionHandler instance
   */
  public static getInstance(): CompletionHandler {
    CompletionHandler.instance ??= new CompletionHandler()
    return CompletionHandler.instance
  }

  /**
   * Handles commit action for inline completion suggestions.
   * @param source - The source that triggered the commit action ('codelens' or other)
   * @description Commits the current completion suggestion by inserting the new content at the current cursor position
   */
  public handleCommit(source: string): void {
    const currentChange: FileTrackerData | null = this.getCurrentChange() ?? null
    if (source === 'codelens') {
      console.log('Handle COMMIT from code lens source')
    } else {
      if (currentChange) {
        const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
        if (activeEditor) {
          const codeEdit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit()
          codeEdit.insert(
            activeEditor.document.uri,
            activeEditor.selection.active,
            `${currentChange.newContent}\n`
          )
          vscode.workspace.applyEdit(codeEdit).then(() => {
            vscode.commands.executeCommand('workbench.action.files.save')
            this.clearFileTracker()
          })
        }
      }
    }
  }

  /**
   * Handles dismiss action for inline completion suggestions.
   * @param source - The source that triggered the dismiss action ('codelens' or other)
   * @description Dismisses the current completion suggestion and clears the file tracker
   */
  public handleDismiss(source: string): void {
    if (source === 'codelens') {
      const currentChange: FileTrackerData | null = this.getCurrentChange() ?? null
      console.log('Handle DISMISS from code lens source')
      console.log({
        source,
        currentChange
      })
    }
    this.clearFileTracker()
  }

  /**
   * Clears the file tracker and resets completion state.
   * @description Hides the status bar, clears file tracker data, hides inline suggestions, and triggers new completion
   */
  public clearFileTracker(): void {
    StatusBarItem.getInstance().hide()
    FileTracker.getInstance().clearFile(CompletionHandler.fileSource ?? '')
    vscode.commands.executeCommand('editor.action.inlineSuggest.hide')
    vscode.commands.executeCommand('editor.action.inlineSuggest.trigger')
  }

  /**
   * Gets the current file change data from the file tracker.
   * @returns The current file tracker data or null if no active editor or file source
   * @description Retrieves the latest file tracker data for the currently active text editor
   */
  private getCurrentChange(): FileTrackerData | null {
    CompletionHandler.fileSource = vscode.window.activeTextEditor?.document.uri.toString()
    if (CompletionHandler.fileSource === undefined) {
      return null
    }
    return FileTracker.getInstance().get(CompletionHandler.fileSource)
  }
}
