import * as vscode from 'vscode'

/**
 * Manages status bar display for extension notifications.
 * @description Provides methods to show, hide, and manage status bar items.
 * Uses Singleton pattern to prevent duplicate status bar items.
 */
export default class StatusBarItem {
  /** Singleton instance of the status bar item manager */
  private static instance: StatusBarItem | undefined
  /** VSCode status bar item instance for displaying messages */
  private readonly statusBarItem: vscode.StatusBarItem | undefined

  /**
   * Private constructor to prevent direct instantiation.
   * @description Creates a status bar item positioned on the right side
   */
  private constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  }

  /**
   * Gets the singleton instance of StatusBarItem.
   * @description Creates a new instance if none exists, otherwise returns the existing instance
   * @returns The singleton StatusBarItem instance
   */
  public static getInstance(): StatusBarItem {
    StatusBarItem.instance ??= new StatusBarItem()
    return StatusBarItem.instance
  }

  /**
   * Shows a message in the status bar.
   * @param text - The text to display in the status bar
   * @param tooltip - Optional tooltip text to show on hover
   * @description Displays the provided text in the status bar with optional tooltip
   */
  public show(text: string, tooltip?: string): void {
    if (this.statusBarItem) {
      this.statusBarItem.text = text
      this.statusBarItem.tooltip = tooltip ?? ''
      this.statusBarItem.show()
    }
  }

  /**
   * Hides the status bar item and cleans up its content.
   * @description Hides the status bar item and resets its text and tooltip
   */
  public hide(): void {
    if (this.statusBarItem) {
      this.cleanup()
      this.statusBarItem.hide()
    }
  }

  /**
   * Cleans up status bar item content by resetting text and tooltip.
   */
  private cleanup(): void {
    if (this.statusBarItem) {
      this.statusBarItem.text = ''
      this.statusBarItem.tooltip = ''
    }
  }

  /**
   * Disposes of the singleton instance and cleans up resources.
   * @description Hides the status bar item and resets the singleton instance
   */
  public static dispose(): void {
    if (StatusBarItem.instance) {
      StatusBarItem.instance.hide()
      StatusBarItem.instance = undefined
    }
  }
}
