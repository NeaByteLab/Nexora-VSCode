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
 * Configuration management utility
 * Handles retrieval and updates of workspace settings
 */
export default class ConfigManager {
  /**
   * Gets the host URL from configuration
   * @returns Host URL or default value
   */
  public static getHost(): string {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    return config.get<string>(configUrlHost) ?? defaultHost
  }

  /**
   * Updates the host configuration setting
   * @param host - New host URL to set
   */
  public static async setHost(host: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    await config.update(configUrlHost, host, vscode.ConfigurationTarget.Global)
  }

  /**
   * Gets the database path from configuration
   * @returns Database path or default value
   */
  public static getDatabasePath(): string {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    return config.get<string>(configDatabasePath) ?? defaultDatabasePath
  }

  /**
   * Updates the database path configuration setting
   * @param databasePath - New database path to set
   */
  public static async setDatabasePath(databasePath: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    await config.update(configDatabasePath, databasePath, vscode.ConfigurationTarget.Global)
  }

  /**
   * Gets the selected model from configuration
   * @returns Model name or default value
   */
  public static getSelectedModel(): string {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    return config.get<string>(configSelectedModel) ?? defaultSelectedModel
  }

  /**
   * Updates the selected model configuration setting
   * @param model - New model name to set
   */
  public static async setSelectedModel(model: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configSection)
    await config.update(configSelectedModel, model, vscode.ConfigurationTarget.Global)
  }

  /**
   * Gets all current configuration values
   * @returns Object containing all configuration values
   */
  public static getConfig(): ConfigurationData {
    return {
      host: ConfigManager.getHost(),
      databasePath: ConfigManager.getDatabasePath(),
      selectedModel: ConfigManager.getSelectedModel()
    }
  }

  /**
   * Registers a listener for configuration changes
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
