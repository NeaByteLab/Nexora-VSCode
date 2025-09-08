import * as vscode from 'vscode'
import { ConfigManager } from '@config/index'
import { ErrorHandler } from '@utils/index'

/**
 * Opens a file picker dialog to allow the user to select a database file
 * Updates the extension configuration with the selected database path
 * Displays confirmation message when database path is successfully set
 */
export default async function (): Promise<void> {
  try {
    const fileUri: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        'Database files': ['db', 'sqlite', 'sqlite3'],
        'All files': ['*']
      },
      title: 'Select Database File'
    })
    if (fileUri?.[0]) {
      const selectedPath: string = fileUri[0].fsPath
      await ConfigManager.setDatabasePath(selectedPath)
      ErrorHandler.showNotification(`Database path set to: ${selectedPath}`, 'info')
    }
  } catch (error: unknown) {
    ErrorHandler.handle(error, 'database selection', true, 'error')
  }
}
