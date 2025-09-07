import { Ollama } from 'ollama'
import { AccountData, ConfigurationData } from '@interfaces/index'
import { AccountManager, ConfigManager } from '@config/index'
import { ErrorHandler, Validator } from '@utils/index'

/**
 * Service for Ollama API integration
 * Manages communication with local or remote Ollama instances
 */
export default class OllamaService {
  private static readonly CONNECTION_HELP_MESSAGE: string = 'Please ensure Ollama is running!'
  private static readonly CONNECTION_ERROR_MESSAGE: string = 'Cannot connect to Ollama at'
  private static readonly TIMEOUT_ERROR_MESSAGE: string = 'Connection timeout to Ollama at'
  private static readonly INVALID_DATABASE_PATH_ERROR_MESSAGE: string = 'Invalid database path'
  private static readonly INVALID_MODEL_ERROR_MESSAGE: string = 'Invalid model name'
  private static readonly TIMEOUT_HELP_MESSAGE: string = 'Please check your network connection.'
  private static readonly FETCHING_MODELS_CONTEXT: string = 'fetching models'
  private host: string
  private databasePath: string
  private selectedModel: string
  private ollama: Ollama

  /**
   * Creates OllamaService instance
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
   * Gets the current configuration
   * @returns Object with current host, database path, and selected model
   */
  public getConfig(): ConfigurationData {
    return {
      host: this.host,
      databasePath: this.databasePath,
      selectedModel: this.selectedModel
    }
  }

  /**
   * Gets available models from Ollama
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
   * Generates code completion using Ollama
   * @param prompt - Text prompt to send to Ollama
   * @param model - Model name to use for generation
   * @returns Promise resolving to generated response text
   */
  public async generateCompletion(prompt: string, model: string): Promise<string> {
    try {
      if (!model || model.trim() === '') {
        throw new Error(OllamaService.INVALID_MODEL_ERROR_MESSAGE)
      }
      this.ollama = await this.getInstance()
      // -- Debug
      console.log('ollama', this.ollama)
      console.log('host', this.host)
      console.log('model', model)
      // -- End Debug
      const response: { response: string } = await this.ollama.generate({
        model,
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
   * Gets Ollama instance with proper configuration
   * Uses account authentication for remote URLs or basic config for local instances
   * @returns Promise resolving to configured Ollama instance
   */
  private async getInstance(): Promise<Ollama> {
    if (Validator.isOllamaUrl(this.host)) {
      if (Validator.isValidPath(this.databasePath)) {
        const account: AccountData | null = await AccountManager.getRandomAccount()
        return new Ollama({
          host: this.host,
          headers: {
            Authorization: `Bearer ${account?.api_key}`,
            'Content-Type': 'application/json'
          }
        })
      } else {
        throw new Error(OllamaService.INVALID_DATABASE_PATH_ERROR_MESSAGE)
      }
    } else {
      return new Ollama({
        host: this.host,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  }
}
