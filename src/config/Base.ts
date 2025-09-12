import * as vscode from 'vscode'
import { ConfigurationData } from '@interfaces/index'
import {
  configSection,
  configUrlHost,
  configDatabasePath,
  configSelectedModel,
  defaultHost,
  defaultDatabasePath,
  defaultSelectedModel
} from '@constants/index'

/**
 * Configuration management utility.
 * @description Handles retrieval and updates of workspace settings
 */
export default class ConfigManager {
  /**
   * Gets the host URL from configuration.
   * @description Retrieves the configured host URL or returns default value
   * @returns Host URL or default value
   */
  public static getUrlHost(): string {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    return config.get<string>(configUrlHost) ?? defaultHost
  }

  /**
   * Updates the host configuration setting.
   * @description Sets the host URL in workspace configuration
   * @param host - New host URL to set
   * @returns Promise that resolves when configuration is updated
   */
  public static async setUrlHost(host: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    await config.update(configUrlHost, host, vscode.ConfigurationTarget.Global)
  }

  /**
   * Gets the database path from configuration.
   * @description Retrieves the configured database path or returns default value
   * @returns Database path or default value
   */
  public static getDatabasePath(): string {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    return config.get<string>(configDatabasePath) ?? defaultDatabasePath
  }

  /**
   * Updates the database path configuration setting.
   * @description Sets the database path in workspace configuration
   * @param databasePath - New database path to set
   * @returns Promise that resolves when configuration is updated
   */
  public static async setDatabasePath(databasePath: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    await config.update(configDatabasePath, databasePath, vscode.ConfigurationTarget.Global)
  }

  /**
   * Gets the selected model from configuration.
   * @description Retrieves the configured model name or returns default value
   * @returns Model name or default value
   */
  public static getSelectedModel(): string {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    return config.get<string>(configSelectedModel) ?? defaultSelectedModel
  }

  /**
   * Updates the selected model configuration setting.
   * @description Sets the model name in workspace configuration
   * @param model - New model name to set
   * @returns Promise that resolves when configuration is updated
   */
  public static async setSelectedModel(model: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    await config.update(configSelectedModel, model, vscode.ConfigurationTarget.Global)
  }

  /**
   * Gets all current configuration values.
   * @description Retrieves all configuration settings as a single object
   * @returns Object containing all configuration values
   */
  public static getConfig(): ConfigurationData {
    return {
      urlHost: ConfigManager.getUrlHost(),
      databasePath: ConfigManager.getDatabasePath(),
      selectedModel: ConfigManager.getSelectedModel()
    }
  }

  /**
   * Registers a listener for configuration changes.
   * @description Sets up a callback function to be called when configuration settings change
   * @param callback - Function to call when configuration changes
   * @returns Disposable to unsubscribe from changes
   */
  public static onDidChangeConfiguration(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
      if (event.affectsConfiguration(configSection)) {
        callback()
      }
    })
  }
}
