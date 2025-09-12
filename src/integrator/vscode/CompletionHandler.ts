import * as vscode from 'vscode'
import { FileTrackerData } from '@interfaces/index'
import { FileTracker, StatusBarItem } from '@integrator/index'
import { LogHandler } from '@utils/index'
import { configSection } from '@constants/index'

/**
 * Handles completion events and provides code lens functionality.
 * @description Manages completion commit/dismiss actions and provides code lenses for completion suggestions
 */
export default class CompletionHandler implements vscode.CodeLensProvider {
  /** Array of code decorations to display */
  private static readonly codeDecorations: vscode.TextEditorDecorationType[] = []
  /** Array of code lenses to display */
  private readonly codeLenses: vscode.CodeLens[] = []
  /** Singleton instance of the completion handler */
  private static instance: CompletionHandler | null = null
  /** Current file source URI for tracking completion state */
  private static fileSource: string | undefined = undefined
  /** Old range of the file */
  private static fileOldRange: vscode.Range | undefined = undefined
  /** New range of the file */
  private static fileNewRange: vscode.Range | undefined = undefined

  /**
   * Private constructor for singleton pattern.
   * @description Initializes the completion handler and sets the current file source
   */
  private constructor() {
    CompletionHandler.fileSource = vscode.window.activeTextEditor?.document.uri.toString()
  }

  /**
   * Provides code lenses for the given document.
   * @description Generates interactive code lenses for completion suggestions and actions
   * @param document - The text document to provide code lenses for
   * @param token - Cancellation token for aborting the operation
   * @returns Promise resolving to code lenses array or null if no lenses available
   */
  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    try {
      if (token.isCancellationRequested) {
        return []
      }
      if (this.codeLenses.length > 0) {
        this.refreshCodeLenses()
        return this.codeLenses
      }
      const fileTrackerData: FileTrackerData = FileTracker.getInstance().get(
        document.uri.toString()
      )
      if (
        Object.keys(fileTrackerData).length > 0 &&
        !['edit', 'delete'].includes(fileTrackerData.type)
      ) {
        const statusTitle: string =
          fileTrackerData.type === 'none' ? fileTrackerData.title : 'Have Pending Changes'
        StatusBarItem.getInstance().show(`$(info) ${configSection}: ${statusTitle}`)
        return []
      }
      if (fileTrackerData.fileState === 'pending') {
        this.clearDecorations()
        const resRange: Array<vscode.Range> | null = this.getContentRange(document, fileTrackerData)
        if (resRange?.[0] && resRange?.[1]) {
          this.handleInsertPreviewCode(resRange, fileTrackerData)
          const gutterDecoration: vscode.TextEditorDecorationType =
            vscode.window.createTextEditorDecorationType({
              gutterIconPath: vscode.Uri.parse(
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9IiMxMDY0OWMiIHN0cm9rZT0iIzBkNGY4MSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHJ4PSIyIiByeT0iMiIvPgogIDxwYXRoIGQ9Ik02IDRsNCA0LTQgNHYtMkg2VjR6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4='
              ),
              isWholeLine: false
            })
          const deletedDecoration: vscode.TextEditorDecorationType =
            vscode.window.createTextEditorDecorationType({
              color: 'rgba(136, 136, 136, 1)',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              borderWidth: '0 0 0 3px',
              borderColor: 'rgba(204, 102, 102, 0.3)',
              isWholeLine: true,
              fontStyle: 'italic',
              fontWeight: 'lighter',
              cursor: 'pointer'
            })
          vscode.window.activeTextEditor?.setDecorations(gutterDecoration, [
            new vscode.Range(
              new vscode.Position(resRange[0].start.line, 0),
              new vscode.Position(resRange[0].start.line, 0)
            )
          ])
          vscode.window.activeTextEditor?.setDecorations(deletedDecoration, [resRange[0]])
          CompletionHandler.codeDecorations.push(gutterDecoration, deletedDecoration)
          if (fileTrackerData.type === 'edit') {
            const createdDecorations: vscode.TextEditorDecorationType =
              vscode.window.createTextEditorDecorationType({
                backgroundColor: 'rgba(255, 255, 128, 0.1)',
                isWholeLine: true
              })
            vscode.window.activeTextEditor?.setDecorations(createdDecorations, [resRange[1]])
            CompletionHandler.codeDecorations.push(createdDecorations)
          }
          const startRange: vscode.Range = new vscode.Range(resRange[0].start, resRange[0].end)
          this.codeLenses.push(
            new vscode.CodeLens(startRange, {
              title: '✓ Accept [TAB]',
              command: 'editor.action.inlineSuggest.commit',
              arguments: ['codelens']
            }),
            new vscode.CodeLens(startRange, {
              title: ' ✕ Reject [ESC]',
              command: 'editor.action.inlineSuggest.dismiss',
              arguments: ['codelens']
            })
          )
          vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri)
          return this.codeLenses
        }
        this.codeLenses.length = 0
        this.clearDecorations()
        this.clearFileTracker()
        this.refreshCodeLenses()
      } else {
        this.clearDecorations()
        this.refreshCodeLenses()
      }
      return []
    } catch (error: unknown) {
      StatusBarItem.getInstance().show(`$(error) ${configSection}: CodeLens Failed`)
      LogHandler.handle(error, 'provideCodeLenses', false, 'error')
      return []
    }
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
   * @description Commits the current completion suggestion by inserting the new content at the current cursor position
   * @param source - The source that triggered the commit action ('codelens' or other)
   */
  public handleCommit(source: string): void {
    try {
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (!activeEditor) {
        return
      }
      const currentChange: FileTrackerData | null = this.getCurrentChange() ?? null
      const codeEdit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit()
      if (source === 'codelens') {
        codeEdit.delete(
          activeEditor.document.uri,
          CompletionHandler.fileOldRange ?? new vscode.Range(0, 0, 0, 0)
        )
        vscode.workspace.applyEdit(codeEdit).then(() => {
          this.saveFileChanges()
        })
        return
      } else {
        if (currentChange) {
          codeEdit.insert(
            activeEditor.document.uri,
            activeEditor.selection.active,
            `${currentChange.newContent}\n`
          )
        }
      }
      vscode.workspace.applyEdit(codeEdit).then(() => {
        this.saveFileChanges()
      })
    } catch (error: unknown) {
      LogHandler.handle(error, 'handleCommit', false, 'error')
    }
  }

  /**
   * Handles dismiss action for inline completion suggestions.
   * @description Dismisses the current completion suggestion and clears the file tracker
   * @param source - The source that triggered the dismiss action ('codelens' or other)
   */
  public handleDismiss(source: string): void {
    try {
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (!activeEditor) {
        return
      }
      if (source === 'codelens') {
        const codeEdit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit()
        codeEdit.delete(
          activeEditor.document.uri,
          CompletionHandler.fileNewRange ?? new vscode.Range(0, 0, 0, 0)
        )
        vscode.workspace.applyEdit(codeEdit).then(() => {
          this.saveFileChanges()
        })
        return
      }
      this.clearFileTracker()
    } catch (error: unknown) {
      LogHandler.handle(error, 'handleDismiss', false, 'error')
    }
  }

  /**
   * Inserts the preview code into the active editor.
   * @description Inserts preview code changes into the editor for user review
   * @param range - The range to insert the preview code into
   * @param fileTrackerData - The file tracker data containing the code changes
   */
  private handleInsertPreviewCode(range: vscode.Range[], fileTrackerData: FileTrackerData): void {
    try {
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (activeEditor) {
        const codeEdit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit()
        codeEdit.insert(
          activeEditor.document.uri,
          range[0]?.end ?? new vscode.Position(0, 0),
          fileTrackerData.newContent.length > 0 ? `\n${fileTrackerData.newContent}` : '',
          {
            needsConfirmation: false,
            label: 'Refactor Code',
            description: fileTrackerData.title,
            iconPath: new vscode.ThemeIcon('book')
          }
        )
        vscode.workspace.applyEdit(codeEdit)
      }
    } catch (error: unknown) {
      LogHandler.handle(error, 'handleInsertPreviewCode', false, 'error')
    }
  }

  /**
   * Saves the file changes.
   * @description Saves the current file and updates the completion state
   */
  private saveFileChanges(): void {
    vscode.commands.executeCommand('workbench.action.files.save')
    StatusBarItem.getInstance().show(`$(check) ${configSection}: Changes Applied`)
    this.codeLenses.length = 0
    this.refreshCodeLenses()
    this.clearDecorations()
    this.clearFileTracker()
  }

  /**
   * Refreshes the code lenses in the active editor.
   * @description Triggers a refresh of code lenses to update their display state
   */
  private refreshCodeLenses(): void {
    const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
    if (!activeEditor) {
      return
    }
    vscode.commands.executeCommand('editor.action.triggerSuggestion')
    vscode.commands.executeCommand('vscode.executeCodeLensProvider', activeEditor.document.uri)
  }

  /**
   * Clears all active code decorations from the editor.
   * @description Disposes of all text editor decorations and resets the decorations array
   */
  private clearDecorations(): void {
    CompletionHandler.codeDecorations.forEach((decoration: vscode.TextEditorDecorationType) => {
      decoration.dispose()
    })
    CompletionHandler.codeDecorations.length = 0
  }

  /**
   * Clears the file tracker and resets completion state.
   * @description Hides the status bar, clears file tracker data, hides inline suggestions, and triggers new completion
   */
  public clearFileTracker(): void {
    try {
      StatusBarItem.getInstance().hide()
      FileTracker.getInstance().clearFile(CompletionHandler.fileSource ?? '')
      vscode.commands.executeCommand('editor.action.inlineSuggest.hide')
      vscode.commands.executeCommand('editor.action.inlineSuggest.trigger')
    } catch (error: unknown) {
      LogHandler.handle(error, 'clearFileTracker', false, 'error')
    }
  }

  /**
   * Gets the range of content changes in the document.
   * @description Calculates the old and new content ranges for code changes based on file tracker data
   * @param document - The text document to analyze
   * @param data - The file tracker data containing old and new content
   * @returns Array containing old and new ranges, or null if old content not found
   */
  private getContentRange(
    document: vscode.TextDocument,
    data: FileTrackerData
  ): Array<vscode.Range> | null {
    const fullDocument: string = document.getText()
    const oldStartIndex: number = fullDocument.indexOf(data.oldContent)
    if (oldStartIndex === -1) {
      return null
    }
    const oldRange: vscode.Range = new vscode.Range(
      document.positionAt(oldStartIndex),
      document.positionAt(oldStartIndex + data.oldContent.length)
    )
    CompletionHandler.fileOldRange = oldRange
    const newRange: vscode.Range = new vscode.Range(
      oldRange.end.line + 1,
      0,
      oldRange.end.line + 1 + data.newContent.split('\n').length - 1,
      oldRange.end.character
    )
    CompletionHandler.fileNewRange = newRange
    return [oldRange, newRange]
  }

  /**
   * Gets the current file change data from the file tracker.
   * @description Retrieves the latest file tracker data for the currently active text editor
   * @returns The current file tracker data or null if no active editor or file source
   */
  private getCurrentChange(): FileTrackerData | null {
    CompletionHandler.fileSource = vscode.window.activeTextEditor?.document.uri.toString()
    if (CompletionHandler.fileSource === undefined) {
      return null
    }
    return FileTracker.getInstance().get(CompletionHandler.fileSource)
  }
}
