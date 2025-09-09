/**
 * VS Code utilities module exports.
 * Re-exports all VS Code integration utilities.
 */
export { default as CodeActionLint } from '@integrator/vscode/CodeActionLint'
export {
  requestOllama,
  requestInlineCompletion,
  requestLintFix
} from '@integrator/vscode/CodeGenerator'
export { default as CompletionEvent } from '@integrator/vscode/CompletionEvent'
export { default as CompletionProvider } from '@integrator/vscode/CompletionProvider'
export { default as ErrorLense } from '@integrator/vscode/ErrorLense'
export { default as KeyboardBinding } from '@integrator/vscode/KeyboardBinding'
export { default as StatusBarItem } from '@integrator/vscode/StatusBarItem'
