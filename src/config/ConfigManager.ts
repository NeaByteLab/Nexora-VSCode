import * as vscode from 'vscode'

/**
 * Manages extension configuration settings
 * Handles retrieval and updates of VSCode workspace settings
 */
export default class ConfigManager {
  private static readonly HOST_KEY: string = 'host'
  private static readonly CONFIG_SECTION: string = 'nexora-vscode'
  private static readonly DATABASE_PATH_KEY: string = 'databasePath'
  private static readonly SELECTED_MODEL_KEY: string = 'selectedModel'

  /**
   * Gets the host URL from configuration
   * @returns Host URL or default value
   */
  public static getHost(): string {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
      this.CONFIG_SECTION
    )
    return config.get<string>(this.HOST_KEY) ?? 'http://localhost:11434'
  }

  /**
   * Gets the database path from configuration
   * @returns Database path or default value
   */
  public static getDatabasePath(): string {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
      this.CONFIG_SECTION
    )
    const path: string = config.get<string>(this.DATABASE_PATH_KEY) ?? '~/nexora.db'
    return path
  }

  /**
   * Updates the host configuration setting
   * @param host - New host URL to set
   */
  public static async setHost(host: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
      this.CONFIG_SECTION
    )
    await config.update(this.HOST_KEY, host, vscode.ConfigurationTarget.Global)
  }

  /**
   * Updates the database path configuration setting
   * @param databasePath - New database path to set
   */
  public static async setDatabasePath(databasePath: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
      this.CONFIG_SECTION
    )
    await config.update(this.DATABASE_PATH_KEY, databasePath, vscode.ConfigurationTarget.Global)
  }

  /**
   * Gets the selected model from configuration
   * @returns Model name or empty string
   */
  public static getSelectedModel(): string {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
      this.CONFIG_SECTION
    )
    return config.get<string>(this.SELECTED_MODEL_KEY) ?? ''
  }

  /**
   * Updates the selected model configuration setting
   * @param model - New model name to set
   */
  public static async setSelectedModel(model: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
      this.CONFIG_SECTION
    )
    await config.update(this.SELECTED_MODEL_KEY, model, vscode.ConfigurationTarget.Global)
  }

  /**
   * Registers a listener for configuration changes
   * @param callback - Function to call when configuration changes
   * @returns Disposable to unsubscribe from changes
   */
  public static onDidChangeConfiguration(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
      if (event.affectsConfiguration(this.CONFIG_SECTION)) {
        callback()
      }
    })
  }

  /**
   * Gets all current configuration values
   * @returns Object containing all configuration values
   */
  public static getConfig(): { host: string; databasePath: string; selectedModel: string } {
    return {
      host: this.getHost(),
      databasePath: this.getDatabasePath(),
      selectedModel: this.getSelectedModel()
    }
  }
}
