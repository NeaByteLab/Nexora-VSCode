import * as vscode from 'vscode'
import { GenerationResult } from '@interfaces/index'
import { QuickDiff } from '@listeners/index'
import { ErrorHandler } from '@utils/index'
import { configSection } from '@constants/index'

/**
 * Manages inline code suggestions using the editor's InlineCompletionItemProvider
 * @description Provides inline suggestions with keyboard shortcuts for code completion
 */
export default class InlineSuggestion implements vscode.InlineCompletionItemProvider {
  /** Quick diff service for managing suggestions */
  private readonly quickDiffService: QuickDiff
  /** Current active suggestion */
  private activeSuggestion: GenerationResult | undefined
  /** Current file path */
  private currentFilePath: string | undefined
  /** Status bar item for suggestion info */
  private statusBarItem: vscode.StatusBarItem | undefined

  /**
   * Initializes a new InlineSuggestion instance
   * @param quickDiffService - Service for managing content differences
   * @param context - Extension context for managing subscriptions
   */
  constructor(quickDiffService: QuickDiff, context: vscode.ExtensionContext) {
    this.quickDiffService = quickDiffService
    this.setupKeyboardShortcuts(context)
    this.setupStatusBar()
  }

  /**
   * Provides inline completion items for the given position
   * @param document - The document in which the command was invoked
   * @param position - The position at which the command was invoked
   * @param _context - Additional context about the completion
   * @param _token - A cancellation token
   * @returns Array of completion items or undefined if no suggestion available
   */
  public provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: vscode.InlineCompletionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.InlineCompletionItem[]> {
    try {
      console.log(`${JSON.stringify(this.activeSuggestion, null, 2)}`)
      if (this.activeSuggestion && this.currentFilePath === document.fileName) {
        if (this.activeSuggestion.lineStart < 1 || this.activeSuggestion.lineEnd < 1) {
          return undefined
        }
        if (this.activeSuggestion.lineStart > this.activeSuggestion.lineEnd) {
          return undefined
        }
        const suggestionStartLine: number = this.activeSuggestion.lineStart - 1
        const suggestionEndLine: number = this.activeSuggestion.lineEnd - 1
        const currentLine: number = position.line
        console.log(
          `Document has ${document.lineCount} lines, cursor at line ${currentLine + 1}, suggestion for lines ${suggestionStartLine + 1} to ${suggestionEndLine + 1}`
        )
        if (currentLine < suggestionStartLine || currentLine > suggestionEndLine) {
          console.log('Cursor not within suggestion range')
          return undefined
        }
        const lines: string[] = this.activeSuggestion.content.split('\n')
        const relativeLine: number = currentLine - suggestionStartLine
        if (relativeLine >= lines.length) {
          console.log('Relative line beyond suggestion content')
          return undefined
        }
        const remainingLines: string[] = lines.slice(relativeLine)
        const remainingContent: string = remainingLines.join('\n')
        const completionItem: vscode.InlineCompletionItem = new vscode.InlineCompletionItem(
          remainingContent,
          new vscode.Range(position, position)
        )
        console.log(`Showing suggestion at cursor: ${position.line}:${position.character}`)
        return [completionItem]
      }
      return undefined
    } catch {
      return undefined
    }
  }

  /**
   * Sets up status bar item for displaying suggestion information
   */
  private setupStatusBar(): void {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
    this.statusBarItem.command = `${configSection}.AcceptSuggestion`
    this.statusBarItem.tooltip = 'Accept Suggestion (TAB)'
  }

  /**
   * Sets up keyboard shortcuts for suggestion actions
   * @param context - Extension context for managing subscriptions
   */
  private setupKeyboardShortcuts(context: vscode.ExtensionContext): void {
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
    const showDiffCommand: vscode.Disposable = vscode.commands.registerCommand(
      `${configSection}.ShowDiff`,
      () => {
        this.showDiff()
      }
    )
    context.subscriptions.push(acceptCtrlCommand, rejectCtrlCommand, showDiffCommand)
  }

  /**
   * Shows inline suggestion in the editor
   * @param suggestion - Code suggestion to display
   * @param filePath - Path to the file being modified
   */
  public showSuggestion(suggestion: GenerationResult, filePath: string): void {
    try {
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (!activeEditor || activeEditor.document.fileName !== filePath) {
        return
      }
      this.activeSuggestion = suggestion
      this.currentFilePath = filePath
      if (!this.quickDiffService.hasOriginalContent(filePath)) {
        this.quickDiffService.storeOriginalContent(filePath, activeEditor.document.getText())
      }
      this.updateStatusBar(suggestion)
      this.quickDiffService.refreshSourceControl(filePath)
      vscode.commands.executeCommand('editor.action.inlineSuggest.trigger')
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'show inline suggestion', true, 'error')
    }
  }

  /**
   * Updates status bar with suggestion information
   * @param suggestion - Code suggestion to display
   */
  private updateStatusBar(suggestion: GenerationResult): void {
    if (!this.statusBarItem) {
      return
    }
    this.statusBarItem.text = `$(lightbulb) Suggestion: ${suggestion.title}`
    this.statusBarItem.show()
  }

  /**
   * Accepts the current suggestion and applies it to the editor
   * @description Commits the active suggestion to the document
   */
  public acceptSuggestion(): void {
    try {
      if (!this.activeSuggestion || this.currentFilePath === undefined) {
        return
      }
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (!activeEditor || activeEditor.document.fileName !== this.currentFilePath) {
        return
      }
      vscode.commands.executeCommand('editor.action.inlineSuggest.commit')
      this.clearSuggestion()
    } catch {
      this.clearSuggestion()
    }
  }

  /**
   * Rejects the current suggestion and clears it from the editor
   * @description Dismisses the active suggestion without applying changes
   */
  public rejectSuggestion(): void {
    try {
      vscode.commands.executeCommand('editor.action.inlineSuggest.dismiss')
      this.clearSuggestion()
    } catch {
      this.clearSuggestion()
    }
  }

  /**
   * Shows diff viewer for the current file
   * @description Opens the diff viewer to compare original and current content
   */
  private showDiff(): void {
    try {
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (!activeEditor || this.currentFilePath === undefined) {
        return
      }
      if (this.quickDiffService.hasOriginalContent(this.currentFilePath)) {
        vscode.commands.executeCommand('scm.openChange', activeEditor.document.uri)
      }
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'show diff', true, 'error')
    }
  }

  /**
   * Clears the current suggestion from the editor and status bar
   * @description Removes suggestion state and hides status bar item
   */
  private clearSuggestion(): void {
    if (this.statusBarItem) {
      this.statusBarItem.hide()
    }
    this.activeSuggestion = undefined
    this.currentFilePath = undefined
  }

  /**
   * Disposes the inline suggestion service and cleans up resources
   * @description Clears suggestions and disposes status bar item
   */
  public dispose(): void {
    this.clearSuggestion()
    if (this.statusBarItem) {
      this.statusBarItem.dispose()
    }
  }
}
