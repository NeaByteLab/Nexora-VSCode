import * as vscode from 'vscode'

/**
 * Manages status bar display for extension notifications
 * @description Provides methods to show, hide, and manage status bar items
 */
export default class StatusBarItem implements vscode.Disposable {
  /** Status bar item instance */
  private readonly statusBarItem: vscode.StatusBarItem | undefined

  /**
   * Initializes a new StatusBarItem instance
   * @description Creates a status bar item positioned on the right side
   */
  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  }

  /**
   * Shows a message in the status bar
   * @param text - The text to display in the status bar
   * @param tooltip - Optional tooltip text to show on hover
   */
  public show(text: string, tooltip?: string): void {
    if (this.statusBarItem) {
      this.statusBarItem.text = text
      this.statusBarItem.tooltip = tooltip ?? ''
      this.statusBarItem.show()
    }
  }

  /**
   * Hides the status bar item
   * @description Cleans up the status bar item and hides it from view
   */
  public hide(): void {
    if (this.statusBarItem) {
      this.cleanup()
      this.statusBarItem.hide()
    }
  }

  /**
   * Disposes the status bar item and cleans up resources
   * @description Properly disposes of the status bar item to prevent memory leaks
   */
  public dispose(): void {
    if (this.statusBarItem) {
      this.statusBarItem.dispose()
    }
  }

  /**
   * Cleans up status bar item content
   * @description Resets text and tooltip to empty values
   */
  private cleanup(): void {
    if (this.statusBarItem) {
      this.statusBarItem.text = ''
      this.statusBarItem.tooltip = ''
    }
  }
}
