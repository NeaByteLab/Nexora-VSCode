import * as vscode from 'vscode'
import { GenerationResult } from '@interfaces/index'
import { requestLintFix } from '@integrator/index'
import { OllamaService } from '@services/index'
import { ErrorHandler } from '@utils/index'

/**
 * Provides code actions for linting functionality in VS Code.
 * Manages lint fix processing state and handles user interactions.
 */
export default class CodeActionLint implements vscode.CodeActionProvider {
  /** Ollama service for AI generation */
  private readonly ollamaService: OllamaService
  /** Track if we're currently processing lint fixes */
  private lintOngoing: boolean = true

  /**
   * Creates a new instance of CodeActionLint.
   * @param context - The VS Code extension context for managing subscriptions
   */
  constructor(context: vscode.ExtensionContext) {
    this.ollamaService = new OllamaService()
    this.setupEventListeners(context)
  }

  /**
   * Sets up event listeners for lint fix interactions.
   * Monitors text editor selection changes and document changes to manage lint processing state.
   * @param context - The VS Code extension context for managing subscriptions
   */
  private setupEventListeners(context: vscode.ExtensionContext): void {
    const selectionChangeDisposable: vscode.Disposable =
      vscode.window.onDidChangeTextEditorSelection(() => {
        if (this.lintOngoing) {
          this.lintOngoing = false
        }
      })
    const documentChangeDisposable: vscode.Disposable = vscode.workspace.onDidChangeTextDocument(
      (event: vscode.TextDocumentChangeEvent) => {
        if (event.contentChanges.length > 0 && this.lintOngoing) {
          this.lintOngoing = false
        }
      }
    )
    context.subscriptions.push(selectionChangeDisposable, documentChangeDisposable)
  }

  /**
   * Provides code actions for the given document and range.
   * Returns available code actions based on diagnostics and current processing state.
   * @param document - The text document in which the command was invoked
   * @param range - The range for which the command was invoked
   * @param context - The code action context containing diagnostics
   * @param token - A cancellation token
   * @returns An array of code actions or undefined if no actions are available
   */
  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[]> {
    try {
      if (token.isCancellationRequested || context.diagnostics.length === 0 || this.lintOngoing) {
        return []
      }
      const codeActions: vscode.CodeAction[] = []
      const userLine: number = range.start.line
      const relevantDiagnostics: vscode.Diagnostic[] = this.getDiagnosticsByNearPosition(
        [...context.diagnostics],
        userLine,
        3
      )
      for (const diagnostic of relevantDiagnostics) {
        const lintFixAction: vscode.CodeAction = new vscode.CodeAction(
          `Fix: ${diagnostic.message}`,
          vscode.CodeActionKind.QuickFix
        )
        lintFixAction.diagnostics = [diagnostic]
        lintFixAction.edit = new vscode.WorkspaceEdit()
        const diagnosticRules: string =
          typeof diagnostic.code === 'string' || typeof diagnostic.code === 'number'
            ? `${diagnostic.code}`
            : ''
        const diagnosticContext: string = `${diagnostic.message} ${diagnostic.source}(${diagnosticRules}) [Ln: ${diagnostic.range.start.line}, Col: ${diagnostic.range.start.character}]`
        const diagnosticResult: GenerationResult | null = await requestLintFix(
          document,
          new vscode.Position(range.start.line, range.start.character),
          this.ollamaService,
          diagnosticContext
        )
        if (diagnosticResult) {
          const replaceRange: vscode.Range = new vscode.Range(
            new vscode.Position(diagnosticResult.lineStart - 1, diagnosticResult.charStart),
            new vscode.Position(diagnosticResult.lineEnd - 1, diagnosticResult.charEnd)
          )
          lintFixAction.edit?.replace(document.uri, replaceRange, diagnosticResult.content)
        }
        codeActions.push(lintFixAction)
        if (token.isCancellationRequested) {
          this.lintOngoing = false
          return codeActions
        }
      }
      this.lintOngoing = false
      return codeActions
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'provideCodeActions', false, 'error')
      return []
    }
  }

  /**
   * Gets the top N diagnostics closest to the user's position.
   * @param diagnostics - All available diagnostics
   * @param userLine - The user's current line position
   * @param limit - Maximum number of diagnostics to return
   * @returns Array of diagnostics sorted by proximity to user position
   */
  private getDiagnosticsByNearPosition(
    diagnostics: vscode.Diagnostic[],
    userLine: number,
    limit: number
  ): vscode.Diagnostic[] {
    try {
      const diagnosticsWithDistance: Array<{ diagnostic: vscode.Diagnostic; distance: number }> =
        diagnostics.map((diagnostic: vscode.Diagnostic) => ({
          diagnostic,
          distance: Math.abs(diagnostic.range.start.line - userLine)
        }))
      diagnosticsWithDistance.sort(
        (
          a: { diagnostic: vscode.Diagnostic; distance: number },
          b: { diagnostic: vscode.Diagnostic; distance: number }
        ) => {
          if (a.distance !== b.distance) {
            return a.distance - b.distance
          }
          return (
            this.getSeverityPriority(b.diagnostic.severity) -
            this.getSeverityPriority(a.diagnostic.severity)
          )
        }
      )
      return diagnosticsWithDistance
        .slice(0, limit)
        .map((item: { diagnostic: vscode.Diagnostic; distance: number }) => item.diagnostic)
    } catch (error: unknown) {
      ErrorHandler.handle(error, 'getDiagnosticsByNearPosition', false, 'error')
      return []
    }
  }

  /**
   * Gets priority value for diagnostic severity.
   * @param severity - The diagnostic severity
   * @returns Priority number (higher = more important)
   */
  private getSeverityPriority(severity: vscode.DiagnosticSeverity): number {
    switch (severity) {
      case vscode.DiagnosticSeverity.Error:
        return 4
      case vscode.DiagnosticSeverity.Warning:
        return 3
      case vscode.DiagnosticSeverity.Information:
        return 2
      case vscode.DiagnosticSeverity.Hint:
        return 1
      default:
        return 0
    }
  }
}
