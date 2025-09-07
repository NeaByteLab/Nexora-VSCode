import { Ollama } from 'ollama'
import { AccountData } from '@interfaces/index'
import { AccountManager, ConfigManager } from '@config/index'
import { ErrorHandler, Validator } from '@utils/index'

/**
 * API service for model integration
 * Manages communication with local or remote model instances
 */
export default class OllamaService {
  /** Error message for connection issues */
  private static readonly CONNECTION_HELP_MESSAGE: string = 'Please ensure the service is running!'
  /** Error message for connection failures */
  private static readonly CONNECTION_ERROR_MESSAGE: string = 'Cannot connect to service at'
  /** Error message for timeout issues */
  private static readonly TIMEOUT_ERROR_MESSAGE: string = 'Connection timeout to service at'
  /** Help message for timeout issues */
  private static readonly TIMEOUT_HELP_MESSAGE: string = 'Please check your network connection.'
  /** Context string for fetching models operation */
  private static readonly FETCHING_MODELS_CONTEXT: string = 'fetching models'
  /** Service host URL */
  private host: string
  /** Database file path */
  private databasePath: string
  /** Currently selected model name */
  private selectedModel: string
  /** Ollama service instance */
  private ollama: Ollama

  /**
   * Creates a new service instance
   * Sets up configuration and registers change listeners
   */
  constructor() {
    this.host = ConfigManager.getHost()
    this.databasePath = ConfigManager.getDatabasePath()
    this.selectedModel = ConfigManager.getSelectedModel()
    this.ollama = new Ollama({ host: this.host })
    ConfigManager.onDidChangeConfiguration(() => {
      this.host = ConfigManager.getHost()
      this.databasePath = ConfigManager.getDatabasePath()
      this.selectedModel = ConfigManager.getSelectedModel()
      this.ollama = new Ollama({ host: this.host })
    })
  }

  /**
   * Gets available models from the service
   * @returns Promise resolving to array of model names
   */
  public async getModels(): Promise<string[]> {
    try {
      const response: { models?: Array<{ name: string }> } = await this.ollama.list()
      return response.models?.map((model: { name: string }) => model.name) ?? []
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
          ErrorHandler.handleOllamaError(
            new Error(
              `${OllamaService.CONNECTION_ERROR_MESSAGE} ${this.host}. ${OllamaService.CONNECTION_HELP_MESSAGE}`
            ),
            OllamaService.FETCHING_MODELS_CONTEXT
          )
        } else if (error.message.includes('timeout')) {
          ErrorHandler.handleOllamaError(
            new Error(
              `${OllamaService.TIMEOUT_ERROR_MESSAGE} ${this.host}. ${OllamaService.TIMEOUT_HELP_MESSAGE}`
            ),
            OllamaService.FETCHING_MODELS_CONTEXT
          )
        } else {
          ErrorHandler.handleOllamaError(error, OllamaService.FETCHING_MODELS_CONTEXT)
        }
      } else {
        ErrorHandler.handleOllamaError(error, OllamaService.FETCHING_MODELS_CONTEXT)
      }
      return []
    }
  }

  /**
   * Generates text completion using the model service
   * @param prompt - Text prompt to send to model
   * @returns Promise resolving to generated response text
   */
  public async generateCompletion(prompt: string): Promise<string> {
    try {
      this.ollama = await this.getInstance()
      const response: { response: string } = await this.ollama.generate({
        model: this.selectedModel,
        prompt,
        stream: false
      })
      return response.response
    } catch (error: unknown) {
      ErrorHandler.handleOllamaError(error, 'generating completion')
      return ''
    }
  }

  /**
   * Gets service instance with proper configuration
   * Uses account authentication for remote URLs or basic config for local instances
   * @returns Promise resolving to configured service instance
   */
  private async getInstance(): Promise<Ollama> {
    if (Validator.isOllamaUrl(this.host) && Validator.isValidPath(this.databasePath)) {
      try {
        const account: AccountData | null = await AccountManager.getRandomAccount()
        return new Ollama({
          host: this.host,
          headers: {
            Authorization: `Bearer ${account?.api_key}`,
            'Content-Type': 'application/json'
          }
        })
      } catch (error: unknown) {
        ErrorHandler.handleConfigError(error, 'getInstance')
      }
    }
    return new Ollama({
      host: this.host,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
