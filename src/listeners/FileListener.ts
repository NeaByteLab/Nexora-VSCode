import * as vscode from 'vscode'
import * as path from 'path'
import { FileContextData } from '@interfaces/index'
import { OllamaService } from '@services/index'
import { ErrorHandler } from '@utils/index'
import { configSection } from '@constants/index'

/**
 * Monitors file changes and cursor position in the active text editor.
 * Captures file context data including content, position, and diagnostics.
 * Provides real-time file monitoring for editor events and document changes.
 */
export default class FileListener {
  /** Service instance for handling operations */
  private readonly ollamaService: OllamaService

  /**
   * Creates a new FileListener instance.
   * @param ollamaService - Service instance for handling operations
   */
  constructor(ollamaService: OllamaService) {
    this.ollamaService = ollamaService
  }

  /**
   * Starts monitoring file changes and cursor position changes.
   * Registers event listeners for active editor changes and cursor movements.
   * Sets up context state and initializes file monitoring.
   * @returns Promise that resolves when initialization is complete
   */
  public async start(): Promise<void> {
    try {
      await vscode.commands.executeCommand(
        'setContext',
        `${configSection}.FileListenerActive`,
        true
      )
      vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
        if (editor !== undefined && this.shouldCaptureContext()) {
          this.captureFileContext(editor)
        }
      })
      vscode.window.onDidChangeTextEditorSelection(
        (event: vscode.TextEditorSelectionChangeEvent) => {
          if (this.shouldCaptureContext()) {
            this.captureFileContext(event.textEditor)
          }
        }
      )
      vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
        const { document }: { document: vscode.TextDocument } = event
        const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
        if (
          activeEditor !== undefined &&
          activeEditor.document === document &&
          this.shouldCaptureContext()
        ) {
          this.captureFileContext(activeEditor)
        }
      })
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (activeEditor !== undefined && this.shouldCaptureContext()) {
        this.captureFileContext(activeEditor)
      }
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'file listener initialization', true, 'error')
    }
  }

  /**
   * Stops monitoring and clears context state.
   * Removes event listeners and resets configuration.
   * @returns Promise that resolves when cleanup is complete
   */
  public async stop(): Promise<void> {
    try {
      await vscode.commands.executeCommand(
        'setContext',
        `${configSection}.FileListenerActive`,
        false
      )
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'file listener stop', true, 'error')
    }
  }

  /**
   * Determines if context should be captured based on editor state.
   * Checks if there is an active editor and the window is focused.
   * @returns True if context should be captured, false otherwise
   */
  private shouldCaptureContext(): boolean {
    return vscode.window.activeTextEditor !== undefined && !vscode.window.state.focused === false
  }

  /**
   * Retrieves the service instance.
   * @returns The OllamaService instance used by this listener
   */
  public getService(): OllamaService {
    return this.ollamaService
  }

  /**
   * Retrieves diagnostics for the specified document.
   * Gets language server diagnostics including errors and warnings.
   * @param document - The document to retrieve diagnostics for
   * @returns Array of diagnostic information, empty array on error
   */
  private getDiagnostics(document: vscode.TextDocument): vscode.Diagnostic[] {
    try {
      const diagnostics: vscode.Diagnostic[] = vscode.languages.getDiagnostics(document.uri)
      return diagnostics
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'get document diagnostics', true, 'error')
      return []
    }
  }

  /**
   * Captures file context data from the specified editor.
   * Extracts file information, cursor position, and diagnostics.
   * @param editor - The text editor to capture context from
   */
  private captureFileContext(editor: vscode.TextEditor): void {
    try {
      const {
        document,
        selection
      }: { document: vscode.TextDocument; selection: vscode.Selection } = editor
      const { languageId, isDirty }: { languageId: string; isDirty: boolean } = document
      const totalLines: number = document.lineCount
      const position: vscode.Position = selection.active
      const filePath: string = document.fileName
      const fileExtension: string = path.extname(filePath)
      const diagnostics: vscode.Diagnostic[] = this.getDiagnostics(document)
      const errorCount: number = diagnostics.filter(
        (d: vscode.Diagnostic) => d.severity === vscode.DiagnosticSeverity.Error
      ).length
      const warningCount: number = diagnostics.filter(
        (d: vscode.Diagnostic) => d.severity === vscode.DiagnosticSeverity.Warning
      ).length
      const fileContext: FileContextData = {
        filePath,
        fileName: path.basename(filePath),
        fileNameWithoutExt: path.basename(filePath, fileExtension),
        fileExtension,
        languageId,
        lineNumber: position.line + 1,
        characterPosition: position.character + 1,
        currentLineText: document.lineAt(position.line).text,
        textBeforeCursor: document.getText(new vscode.Range(new vscode.Position(0, 0), position)),
        textAfterCursor: document.getText(
          new vscode.Range(position, new vscode.Position(totalLines, 0))
        ),
        totalLines,
        isDirty
      }
      this.handleFileContext(fileContext, diagnostics, errorCount, warningCount)
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'file context capture', true, 'error')
    }
  }

  /**
   * Processes and logs file context data to the console.
   * Formats diagnostics and code context for logging output.
   * @param context - The file context data to process
   * @param diagnostics - Document diagnostics
   * @param errorCount - Number of errors in the document
   * @param warningCount - Number of warnings in the document
   */
  private handleFileContext(
    context: FileContextData,
    diagnostics: vscode.Diagnostic[],
    errorCount: number,
    warningCount: number
  ): void {
    try {
      const formattedDiagnostics: string = diagnostics
        .map((d: vscode.Diagnostic) => {
          const line: number = d.range.start.line + 1
          const col: number = d.range.start.character + 1
          const source: string = d.source !== undefined ? `${d.source}` : ''
          let rules: string = ''
          if (d.code !== undefined) {
            if (typeof d.code === 'string' || typeof d.code === 'number') {
              rules = `${d.code}`
            } else if (typeof d.code === 'object' && 'value' in d.code) {
              rules = `${d.code.value}`
            }
          }
          return `- ${d.message} ${source}(${rules}) [Ln: ${line}, Col: ${col}]`
        })
        .join('\n')
      const linesBefore: string[] = context.textBeforeCursor.split('\n')
      const codeBefore: string = linesBefore.slice(Math.max(0, linesBefore.length - 30)).join('\n')
      const linesAfter: string[] = context.textAfterCursor.split('\n')
      const codeAfter: string = linesAfter.slice(0, Math.min(30, linesAfter.length)).join('\n')
      const logMessage: string = `
You are AI Agent that can create code auto completion & code generation.

# Rules you must follow
- Follow the existing code style and naming conventions
- Use best practices and clean code principles
- Write only necessary, high-quality code
- Maintain consistency with the existing codebase
- Provide clear, readable solutions

# Trigger context
- File: ${context.fileName} (${context.languageId})
- Path: ${context.filePath}
- Position: Line ${context.lineNumber}, Char ${context.characterPosition}
- Current Line: "${context.currentLineText}"
- Total Lines: ${context.totalLines}
- Is Dirty: ${context.isDirty}
- Errors: ${errorCount}, Warnings: ${warningCount}

# Diagnostics
${formattedDiagnostics || 'No diagnostics found'}

# Code before cursor (30 lines before current line)
\`\`\`${context.languageId}
${codeBefore}
\`\`\`

# Code after cursor (30 lines after current line)
\`\`\`${context.languageId}
${codeAfter}
\`\`\`
`.trim()
      console.log(logMessage)
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'log file context', true, 'error')
    }
  }
}
