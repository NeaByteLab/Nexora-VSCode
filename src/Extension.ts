import * as vscode from 'vscode'

/**
 * Activates the extension when VSCode starts up
 * @param context - The extension context provided by VSCode
 */
export function activate(context: vscode.ExtensionContext): void {
  const disposable: vscode.Disposable = vscode.commands.registerCommand(
    'nexora-vscode.helloWorld',
    () => {
      vscode.window.showInformationMessage('Hello World from Nexora-VSCode!')
    }
  )
  context.subscriptions.push(disposable)
}

/**
 * Deactivates the extension when VSCode shuts down
 * @returns undefined when deactivation is complete
 */
export function deactivate(): undefined | void {
  return undefined
}
