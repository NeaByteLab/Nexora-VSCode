/**
 * VS Code integration utilities module.
 * Provides code completion, linting, error handling, and editor integration functionality.
 * Re-exports all VS Code integration utilities.
 */

export {
  requestOllama,
  requestInlineCompletion,
  requestLintFix
} from '@integrator/vscode/CodeGenerator'
export { default as CompletionDiff } from '@integrator/vscode/CompletionDiff'
export { default as CompletionEvent } from '@integrator/vscode/CompletionEvent'
export { default as CompletionHandler } from '@integrator/vscode/CompletionHandler'
export { default as CompletionProvider } from '@integrator/vscode/CompletionProvider'
export { default as ErrorLense } from '@integrator/vscode/ErrorLense'
export { default as StatusBarItem } from '@integrator/vscode/StatusBarItem'
