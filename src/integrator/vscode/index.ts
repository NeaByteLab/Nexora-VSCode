/**
 * VS Code integration utilities module.
 * @description Provides code completion, linting, error handling, and editor integration functionality
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
export { default as StatusBarItem } from '@integrator/vscode/StatusBarItem'
