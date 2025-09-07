import { Ollama } from 'ollama'
import { AccountData, CompletionResult } from '@interfaces/index'
import { KnexManager, ConfigManager } from '@config/index'
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
  private urlHost: string
  /** Database file path */
  private databasePath: string
  /** Currently selected model name */
  private selectedModel: string
  /** Model service instance */
  private ollama: Ollama

  /**
   * Creates a new service instance
   * Sets up configuration and registers change listeners
   */
  constructor() {
    this.urlHost = ConfigManager.getHost()
    this.databasePath = ConfigManager.getDatabasePath()
    this.selectedModel = ConfigManager.getSelectedModel()
    this.ollama = new Ollama({ host: this.urlHost })
    ConfigManager.onDidChangeConfiguration(() => {
      this.urlHost = ConfigManager.getHost()
      this.databasePath = ConfigManager.getDatabasePath()
      this.selectedModel = ConfigManager.getSelectedModel()
      this.ollama = new Ollama({ host: this.urlHost })
    })
  }

  /**
   * Handles service errors with appropriate error messages
   * @param error - The error to handle
   */
  private handleError(error: unknown): void {
    if (error instanceof Error) {
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        ErrorHandler.handleOllamaError(
          new Error(
            `${OllamaService.CONNECTION_ERROR_MESSAGE} ${this.urlHost}. ${OllamaService.CONNECTION_HELP_MESSAGE}`
          ),
          OllamaService.FETCHING_MODELS_CONTEXT
        )
      } else if (error.message.includes('timeout')) {
        ErrorHandler.handleOllamaError(
          new Error(
            `${OllamaService.TIMEOUT_ERROR_MESSAGE} ${this.urlHost}. ${OllamaService.TIMEOUT_HELP_MESSAGE}`
          ),
          OllamaService.FETCHING_MODELS_CONTEXT
        )
      } else {
        ErrorHandler.handleOllamaError(error, OllamaService.FETCHING_MODELS_CONTEXT)
      }
    } else {
      ErrorHandler.handleOllamaError(error, OllamaService.FETCHING_MODELS_CONTEXT)
    }
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
      this.handleError(error)
      return []
    }
  }

  /**
   * Generates text completion using the model service
   * @param prompt - Text prompt to send to model
   * @returns Promise resolving to generated response text
   */
  public async generateCompletion(prompt: string): Promise<CompletionResult> {
    try {
      this.ollama = await this.getInstance()
      const data: { response: string } = await this.ollama.generate({
        model: this.selectedModel,
        prompt,
        options: {
          temperature: 0.1
        },
        keep_alive: '5m',
        think: false,
        stream: false
      })
      return data.response
    } catch (error: unknown) {
      this.handleError(error)
      return null
    }
  }

  /**
   * Gets service instance with proper configuration
   * Uses account authentication for remote URLs or basic config for local instances
   * @returns Promise resolving to configured service instance
   */
  private async getInstance(): Promise<Ollama> {
    if (Validator.isOllamaUrl(this.urlHost) && Validator.isValidPath(this.databasePath)) {
      try {
        const knexManager: KnexManager = new KnexManager(this.databasePath)
        const accountResult: AccountData | null = await knexManager.getRandomAccount()
        return new Ollama({
          host: this.urlHost,
          headers: {
            Authorization: `Bearer ${accountResult?.api_key}`,
            'Content-Type': 'application/json'
          }
        })
      } catch (error: unknown) {
        ErrorHandler.handleConfigError(error, 'getInstance')
      }
    }
    return new Ollama({
      host: this.urlHost,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
