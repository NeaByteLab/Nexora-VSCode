import * as vscode from 'vscode'
import { configSection } from '@constants/index'

/**
 * Quick diff provider for suggestions
 * @description Provides original content for diff comparison without Git commits
 */
export default class QuickDiff {
  /** Maximum number of files to store original content for */
  private static readonly MAX_FILES: number = 50
  /** Suffix for original content URIs */
  private static readonly ORIGINAL_SUFFIX: string = '.ORIGINAL'
  /** Name of the source control */
  private static readonly SOURCE_CONTROL_NAME: string = 'Code Suggestions'
  /** Storage for original file contents */
  private readonly originalContent: Map<string, string> = new Map()
  /** Source control instance */
  private sourceControl: vscode.SourceControl | undefined

  /**
   * Registers the quick diff provider with the editor
   * @param context - Extension context for managing subscriptions
   * @returns Disposable for cleanup
   */
  public register(context: vscode.ExtensionContext): vscode.Disposable {
    const contentProvider: vscode.Disposable = vscode.workspace.registerTextDocumentContentProvider(
      configSection,
      {
        provideTextDocumentContent: (uri: vscode.Uri): string => {
          return this.getOriginalContent(uri)
        }
      }
    )
    this.sourceControl = vscode.scm.createSourceControl(
      configSection,
      QuickDiff.SOURCE_CONTROL_NAME
    )
    this.sourceControl.quickDiffProvider = {
      provideOriginalResource: (uri: vscode.Uri): vscode.ProviderResult<vscode.Uri> => {
        return this.provideOriginalResource(uri)
      }
    }
    this.sourceControl.createResourceGroup('changes', 'Changes')
    context.subscriptions.push(contentProvider, this.sourceControl)
    return this.sourceControl
  }

  /**
   * Stores original content before suggestions
   * @param filePath - Path to the file
   * @param content - Original file content
   */
  public storeOriginalContent(filePath: string, content: string): void {
    if (this.originalContent.size >= QuickDiff.MAX_FILES) {
      const firstKey: string | undefined = this.originalContent.keys().next().value
      if (firstKey !== undefined) {
        this.originalContent.delete(firstKey)
      }
    }
    this.originalContent.set(filePath, content)
    this.refreshSourceControl(filePath)
  }

  /**
   * Provides original resource URI for quick diff
   * @param uri - Current file URI
   * @returns Original resource URI or undefined
   */
  private provideOriginalResource(uri: vscode.Uri): vscode.ProviderResult<vscode.Uri> {
    if (uri.scheme === 'file' && this.originalContent.has(uri.fsPath)) {
      return vscode.Uri.parse(`${configSection}:${uri.fsPath}${QuickDiff.ORIGINAL_SUFFIX}`)
    }
    return undefined
  }

  /**
   * Gets original content for diff comparison
   * @param uri - Original resource URI
   * @returns Original file content
   */
  public getOriginalContent(uri: vscode.Uri): string {
    const filePath: string = uri.fsPath.replace(QuickDiff.ORIGINAL_SUFFIX, '')
    return this.originalContent.get(filePath) ?? ''
  }

  /**
   * Checks if file has original content stored
   * @param filePath - Path to the file
   * @returns True if original content exists
   */
  public hasOriginalContent(filePath: string): boolean {
    return this.originalContent.has(filePath)
  }

  /**
   * Refreshes the source control to show changes
   * @param filePath - Path to the file to refresh
   */
  public refreshSourceControl(filePath: string): void {
    if (this.sourceControl && this.originalContent.has(filePath)) {
      this.sourceControl.inputBox.value = ''
      this.sourceControl.inputBox.placeholder = QuickDiff.SOURCE_CONTROL_NAME
      this.sourceControl.inputBox.value = ' '
      this.sourceControl.inputBox.value = ''
    }
  }
}
