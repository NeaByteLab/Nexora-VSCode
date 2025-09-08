import * as vscode from 'vscode'
import * as path from 'path'
import { FileContextData } from '@interfaces/index'
import { BuildContext, ProviderContext } from '@listeners/index'
import { OllamaService } from '@services/index'
import { ErrorHandler } from '@utils/index'
import { configSection } from '@constants/index'

/**
 * Monitors file changes and cursor position in the active text editor
 * @description Captures file context data including content, position, and diagnostics
 */
export default class FileListener {
  /** Service instance for handling operations */
  private readonly ollamaService: OllamaService
  /** Extension context for managing subscriptions */
  private readonly context: vscode.ExtensionContext
  /** Debounce timer for file context handling */
  private debounceTimer: ReturnType<typeof setTimeout> | undefined
  /** Debounce delay in milliseconds */
  private readonly debounceDelay: number = 300

  /**
   * Initializes a new FileListener instance
   * @param ollamaService - Service instance for handling operations
   * @param context - Extension context for managing subscriptions
   */
  constructor(ollamaService: OllamaService, context: vscode.ExtensionContext) {
    this.ollamaService = ollamaService
    this.context = context
  }

  /**
   * Starts monitoring file changes and cursor position changes
   * @description Registers event listeners for active editor changes and cursor movements
   * @returns Promise that resolves when initialization is complete
   */
  public async start(): Promise<void> {
    try {
      await vscode.commands.executeCommand(
        'setContext',
        `${configSection}.FileListenerActive`,
        true
      )
      const activeEditorListener: vscode.Disposable = vscode.window.onDidChangeActiveTextEditor(
        (editor: vscode.TextEditor | undefined) => {
          if (editor !== undefined && this.shouldCaptureContext()) {
            this.captureFileContext(editor)
          }
        }
      )
      const selectionListener: vscode.Disposable = vscode.window.onDidChangeTextEditorSelection(
        (event: vscode.TextEditorSelectionChangeEvent) => {
          if (this.shouldCaptureContext()) {
            this.captureFileContext(event.textEditor)
          }
        }
      )
      const documentListener: vscode.Disposable = vscode.workspace.onDidChangeTextDocument(
        (event: vscode.TextDocumentChangeEvent) => {
          const { document }: { document: vscode.TextDocument } = event
          const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
          if (
            activeEditor !== undefined &&
            activeEditor.document === document &&
            this.shouldCaptureContext()
          ) {
            this.captureFileContext(activeEditor)
          }
        }
      )
      this.context.subscriptions.push(activeEditorListener, selectionListener, documentListener)
      const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
      if (activeEditor !== undefined && this.shouldCaptureContext()) {
        this.captureFileContext(activeEditor)
      }
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'file listener initialization', true, 'error')
    }
  }

  /**
   * Stops monitoring and clears context state
   * @description Removes event listeners and resets configuration
   * @returns Promise that resolves when cleanup is complete
   */
  public async stop(): Promise<void> {
    try {
      if (this.debounceTimer !== undefined) {
        clearTimeout(this.debounceTimer)
        this.debounceTimer = undefined
      }
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
   * Determines if context should be captured based on editor state
   * @description Checks if there is an active editor and the window is focused
   * @returns True if context should be captured, false otherwise
   */
  private shouldCaptureContext(): boolean {
    return vscode.window.activeTextEditor !== undefined && !vscode.window.state.focused === false
  }

  /**
   * Retrieves the service instance
   * @returns The OllamaService instance used by this listener
   */
  public getService(): OllamaService {
    return this.ollamaService
  }

  /**
   * Retrieves diagnostics for the specified document
   * @description Gets language server diagnostics including errors and warnings
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
   * Captures file context data from the specified editor
   * @description Extracts file information, cursor position, and diagnostics
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
   * Processes and logs file context data to the console
   * @description Formats diagnostics and code context for logging output
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
      if (this.debounceTimer !== undefined) {
        clearTimeout(this.debounceTimer)
      }
      this.debounceTimer = setTimeout(() => {
        const diagnosticsList: string = diagnostics
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
        const codeBefore: string = linesBefore
          .slice(Math.max(0, linesBefore.length - 30))
          .join('\n')
        const linesAfter: string[] = context.textAfterCursor.split('\n')
        const codeAfter: string = linesAfter.slice(0, Math.min(30, linesAfter.length)).join('\n')
        const contextString: string = (
          BuildContext as (
            context: FileContextData,
            errorCount: number,
            warningCount: number,
            diagnosticsList: string,
            codeBefore: string,
            codeAfter: string
          ) => string
        )(context, errorCount, warningCount, diagnosticsList, codeBefore, codeAfter)
        ;(ProviderContext as (ollamaService: OllamaService, prompt: string) => Promise<void>)(
          this.ollamaService,
          contextString
        ).catch((error: unknown) => {
          ErrorHandler.handle(error, 'provider context', true, 'error')
        })
        this.debounceTimer = undefined
      }, this.debounceDelay)
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'log file context', true, 'error')
    }
  }
}
