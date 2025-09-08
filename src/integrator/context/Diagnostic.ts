import * as vscode from 'vscode'
import { DiagnosticContextData } from '@interfaces/index'

/**
 * Extracts diagnostic information from a VS Code text document.
 * Analyzes errors and warnings, returning counts and formatted problem descriptions.
 *
 * @param document - The VS Code text document to analyze
 * @returns Object containing problem list, error count, and warning count
 */
export default function (document: vscode.TextDocument): DiagnosticContextData {
  const diagnosticData: readonly vscode.Diagnostic[] = vscode.languages.getDiagnostics(document.uri)
  const problemErrCount: number = diagnosticData.filter(
    (d: vscode.Diagnostic) => d.severity === vscode.DiagnosticSeverity.Error
  ).length
  const problemWarningCount: number = diagnosticData.filter(
    (d: vscode.Diagnostic) => d.severity === vscode.DiagnosticSeverity.Warning
  ).length
  const problemList: string = diagnosticData
    .map((d: vscode.Diagnostic) => {
      const line: number = d.range.start.line + 1
      const char: number = d.range.start.character + 1
      const source: string = d.source ?? ''
      const rules: string =
        typeof d.code === 'string' || typeof d.code === 'number' ? `${d.code}` : ''
      return `- ${d.message} ${source}(${rules}) [Ln: ${line}, Col: ${char}]`
    })
    .join('\n')
  return { problemList, problemErrCount, problemWarningCount }
}
