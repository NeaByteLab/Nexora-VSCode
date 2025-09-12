import * as vscode from 'vscode'
import { LogHandler } from '@utils/index'

/**
 * ErrorLense class for displaying diagnostics with visual enhancements.
 * @description Provides line highlighting, diagnostic text append, and gutter icons for errors and warnings
 */
export default class ErrorLense {
  /** Extension context for managing subscriptions */
  private readonly context: vscode.ExtensionContext
  /** Decoration type for error line highlighting */
  private readonly errorLineDecoration: vscode.TextEditorDecorationType
  /** Decoration type for warning line highlighting */
  private readonly warningLineDecoration: vscode.TextEditorDecorationType
  /** Decoration type for info line highlighting */
  private readonly infoLineDecoration: vscode.TextEditorDecorationType
  /** Decoration type for diagnostic text append */
  private readonly diagnosticTextDecoration: vscode.TextEditorDecorationType
  /** Currently active editor */
  private activeEditor: vscode.TextEditor | undefined

  /**
   * Initializes a new ErrorLense instance.
   * @param context - Extension context for managing subscriptions
   */
  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.errorLineDecoration = vscode.window.createTextEditorDecorationType({
      gutterIconPath: vscode.Uri.parse(
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNyIgZmlsbD0iI2NjNjY2NiIgc3Ryb2tlPSIjYWE0NDQ0IiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxwYXRoIGQ9Ik04IDR2NE04IDEwaC4wMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+'
      ),
      backgroundColor: 'rgba(204, 102, 102, 0.08)',
      borderWidth: '0 0 0 3px',
      borderColor: 'rgba(204, 102, 102, 0.3)',
      isWholeLine: true
    })
    this.warningLineDecoration = vscode.window.createTextEditorDecorationType({
      gutterIconPath: vscode.Uri.parse(
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNOCAxTDE0IDEzSDJMNCAxWiIgZmlsbD0iI2RkYjM2NiIgc3Ryb2tlPSIjY2M5OTMzIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxwYXRoIGQ9Ik04IDV2M004IDEwaC4wMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+'
      ),
      backgroundColor: 'rgba(221, 179, 102, 0.08)',
      borderWidth: '0 0 0 3px',
      borderColor: 'rgba(221, 179, 102, 0.3)',
      isWholeLine: true
    })
    this.infoLineDecoration = vscode.window.createTextEditorDecorationType({
      gutterIconPath: vscode.Uri.parse(
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNyIgZmlsbD0iIzY2YjNmZiIgc3Ryb2tlPSIjNDQ5OWVlIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxwYXRoIGQ9Ik04IDR2NE04IDEwaC4wMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+'
      ),
      backgroundColor: 'rgba(102, 179, 255, 0.08)',
      borderWidth: '0 0 0 3px',
      borderColor: 'rgba(102, 179, 255, 0.3)',
      isWholeLine: true
    })
    this.diagnosticTextDecoration = vscode.window.createTextEditorDecorationType({
      gutterIconPath: vscode.Uri.parse(
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNyIgZmlsbD0iIzk5OTk5OSIgc3Ryb2tlPSIjNzc3Nzc3IiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxwYXRoIGQ9Ik04IDR2NE04IDEwaC4wMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+'
      ),
      after: {
        color: 'rgba(153, 153, 153, 0.7)',
        margin: '0 0 0 1em',
        fontWeight: '400'
      }
    })
  }

  /**
   * Initializes the ErrorLense service by registering event listeners and applying decorations.
   */
  public initialize(): void {
    try {
      const activeEditorDisposable: vscode.Disposable = vscode.window.onDidChangeActiveTextEditor(
        (editor: vscode.TextEditor | undefined) => {
          this.activeEditor = editor
          if (editor) {
            this.updateDecorations(editor)
          }
        }
      )
      const selectionEditorDisposable: vscode.Disposable =
        vscode.window.onDidChangeTextEditorSelection(
          (event: vscode.TextEditorSelectionChangeEvent) => {
            if (event.textEditor != null) {
              this.updateDecorations(event.textEditor)
            }
          }
        )
      const documentChangeDisposable: vscode.Disposable = vscode.workspace.onDidChangeTextDocument(
        (event: vscode.TextDocumentChangeEvent) => {
          if (this.activeEditor && this.activeEditor.document === event.document) {
            this.updateDecorations(this.activeEditor)
          }
        }
      )
      const diagnosticChangeDisposable: vscode.Disposable = vscode.languages.onDidChangeDiagnostics(
        (event: vscode.DiagnosticChangeEvent) => {
          if (this.activeEditor && event.uris.includes(this.activeEditor.document.uri)) {
            this.updateDecorations(this.activeEditor)
          }
        }
      )
      this.activeEditor = vscode.window.activeTextEditor
      if (this.activeEditor) {
        this.updateDecorations(this.activeEditor)
      }
      this.context.subscriptions.push(
        activeEditorDisposable,
        selectionEditorDisposable,
        documentChangeDisposable,
        diagnosticChangeDisposable
      )
    } catch (error: unknown) {
      LogHandler.handle(error, 'error lens initialize', false, 'error')
    }
  }

  /**
   * Updates visual decorations for the given editor based on diagnostics.
   * @param editor - The text editor to update decorations for
   */
  private updateDecorations(editor: vscode.TextEditor): void {
    try {
      const diagnostics: readonly vscode.Diagnostic[] = vscode.languages.getDiagnostics(
        editor.document.uri
      )
      this.clearDecorations(editor)
      const errorRanges: vscode.Range[] = []
      const warningRanges: vscode.Range[] = []
      const infoRanges: vscode.Range[] = []
      const textDecorations: vscode.DecorationOptions[] = []
      const lineDiagnostics: Map<number, vscode.Diagnostic[]> = new Map()
      diagnostics.forEach((diagnostic: vscode.Diagnostic) => {
        const lineNumber: number = diagnostic.range.start.line
        if (!lineDiagnostics.has(lineNumber)) {
          lineDiagnostics.set(lineNumber, [])
        }
        lineDiagnostics.get(lineNumber)?.push(diagnostic)
      })
      lineDiagnostics.forEach((lineDiags: vscode.Diagnostic[], lineNumber: number) => {
        const line: vscode.TextLine = editor.document.lineAt(lineNumber)
        const lineRange: vscode.Range = new vscode.Range(
          new vscode.Position(lineNumber, 0),
          new vscode.Position(lineNumber, line.text.length)
        )
        let highestSeverity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Hint
        for (const diagnostic of lineDiags) {
          if (diagnostic.severity < highestSeverity) {
            highestSeverity = diagnostic.severity
          }
        }
        switch (highestSeverity) {
          case vscode.DiagnosticSeverity.Error:
            errorRanges.push(lineRange)
            break
          case vscode.DiagnosticSeverity.Warning:
            warningRanges.push(lineRange)
            break
          case vscode.DiagnosticSeverity.Information:
            infoRanges.push(lineRange)
            break
          case vscode.DiagnosticSeverity.Hint:
            infoRanges.push(lineRange)
            break
        }
      })
      const latestDiagnostics: Map<number, vscode.Diagnostic> = new Map()
      diagnostics.forEach((diagnostic: vscode.Diagnostic) => {
        const lineNumber: number = diagnostic.range.start.line
        latestDiagnostics.set(lineNumber, diagnostic)
      })
      latestDiagnostics.forEach((diagnostic: vscode.Diagnostic, lineNumber: number) => {
        const line: vscode.TextLine = editor.document.lineAt(lineNumber)
        const diagnosticText: string = this.formatDiagnosticText(diagnostic)
        textDecorations.push({
          range: new vscode.Range(
            new vscode.Position(lineNumber, line.text.length),
            new vscode.Position(lineNumber, line.text.length)
          ),
          renderOptions: {
            after: {
              contentText: ` ${diagnosticText}`,
              color: this.getDiagnosticColor(diagnostic.severity)
            }
          }
        })
      })
      editor.setDecorations(this.errorLineDecoration, errorRanges)
      editor.setDecorations(this.warningLineDecoration, warningRanges)
      editor.setDecorations(this.infoLineDecoration, infoRanges)
      editor.setDecorations(this.diagnosticTextDecoration, textDecorations)
    } catch (error: unknown) {
      LogHandler.handle(error, 'error lens update decorations', false, 'error')
    }
  }

  /**
   * Removes all visual decorations from the editor.
   * @param editor - The text editor to clear decorations from
   */
  private clearDecorations(editor: vscode.TextEditor): void {
    editor.setDecorations(this.errorLineDecoration, [])
    editor.setDecorations(this.warningLineDecoration, [])
    editor.setDecorations(this.infoLineDecoration, [])
    editor.setDecorations(this.diagnosticTextDecoration, [])
  }

  /**
   * Formats diagnostic text for inline display.
   * @param diagnostic - The diagnostic to format
   * @returns Formatted diagnostic text with severity prefix
   */
  private formatDiagnosticText(diagnostic: vscode.Diagnostic): string {
    const severity: string = this.getSeverityText(diagnostic.severity)
    return `[${severity}]: ${diagnostic.message}`
  }

  /**
   * Converts diagnostic severity to text representation.
   * @param severity - The diagnostic severity level
   * @returns Text representation of the severity level
   */
  private getSeverityText(severity: vscode.DiagnosticSeverity): string {
    switch (severity) {
      case vscode.DiagnosticSeverity.Error:
        return 'ERROR'
      case vscode.DiagnosticSeverity.Warning:
        return 'WARN'
      case vscode.DiagnosticSeverity.Information:
        return 'INFO'
      case vscode.DiagnosticSeverity.Hint:
        return 'HINT'
      default:
        return 'UNKNOWN'
    }
  }

  /**
   * Returns the color code for diagnostic severity display.
   * @param severity - The diagnostic severity level
   * @returns RGBA color string for the severity level
   */
  private getDiagnosticColor(severity: vscode.DiagnosticSeverity): string {
    switch (severity) {
      case vscode.DiagnosticSeverity.Error:
        return '#cc6666'
      case vscode.DiagnosticSeverity.Warning:
        return '#ddb366'
      case vscode.DiagnosticSeverity.Information:
        return '#66b3ff'
      case vscode.DiagnosticSeverity.Hint:
        return '#999999'
      default:
        return '#999999'
    }
  }
}
