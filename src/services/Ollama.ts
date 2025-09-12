import { Ollama, ChatResponse } from 'ollama'
import { ChatRequest, AccountData, CompletionResult, CompletionType } from '@interfaces/index'
import { ContextBuilder } from '@integrator/index'
import { KnexManager, ConfigManager } from '@config/index'
import { LogHandler, Validator } from '@utils/index'

/**
 * Service for AI model communication.
 * @description Handles interactions with local or remote model services for code generation and completion
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
   * Initializes the service instance.
   * @description Configures the service and sets up configuration change listeners
   */
  constructor() {
    this.urlHost = ConfigManager.getUrlHost()
    this.databasePath = ConfigManager.getDatabasePath()
    this.selectedModel = ConfigManager.getSelectedModel()
    this.ollama = new Ollama({ host: this.urlHost })
    ConfigManager.onDidChangeConfiguration(() => {
      this.urlHost = ConfigManager.getUrlHost()
      this.databasePath = ConfigManager.getDatabasePath()
      this.selectedModel = ConfigManager.getSelectedModel()
      this.ollama = new Ollama({ host: this.urlHost })
    })
  }

  /**
   * Processes service errors and provides user-friendly messages.
   * @description Handles different types of connection and timeout errors with appropriate user feedback
   * @param error - The error object to process
   */
  private handleError(error: unknown): void {
    if (error instanceof Error) {
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        LogHandler.handleOllamaError(
          new Error(
            `${OllamaService.CONNECTION_ERROR_MESSAGE} ${this.urlHost}. ${OllamaService.CONNECTION_HELP_MESSAGE}`
          ),
          OllamaService.FETCHING_MODELS_CONTEXT
        )
      } else if (error.message.includes('timeout')) {
        LogHandler.handleOllamaError(
          new Error(
            `${OllamaService.TIMEOUT_ERROR_MESSAGE} ${this.urlHost}. ${OllamaService.TIMEOUT_HELP_MESSAGE}`
          ),
          OllamaService.FETCHING_MODELS_CONTEXT
        )
      } else {
        LogHandler.handleOllamaError(error, OllamaService.FETCHING_MODELS_CONTEXT)
      }
    } else {
      LogHandler.handleOllamaError(error, OllamaService.FETCHING_MODELS_CONTEXT)
    }
  }

  /**
   * Retrieves available models from the service.
   * @description Fetches the list of available models from the configured service endpoint
   * @returns Promise that resolves to an array of model names
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
   * Generates text completion using the model service.
   * @description Sends a prompt to the model and returns the generated response
   * @param prompt - Text input to send to the model
   * @param format - Optional format specification for structured output
   * @returns Promise that resolves to the generated response or structured data
   */
  public async generateCompletion(
    prompt: string,
    format?: object,
    type: CompletionType = 'completion'
  ): Promise<ChatResponse | CompletionResult> {
    try {
      this.ollama = await this.getInstance()
      const chatMessages: Array<{ role: string; content: string }> = []
      const systemContext: string = ContextBuilder.getSystemPrompt(type)
      if (format) {
        chatMessages.push({ role: 'system', content: systemContext })
      }
      chatMessages.push({ role: 'user', content: prompt })
      const chatRequest: ChatRequest = {
        model: this.selectedModel,
        messages: chatMessages,
        options: {
          temperature: 0.1
        },
        keep_alive: '5m',
        think: false,
        stream: false
      }
      if (format) {
        chatRequest.format = format
      }
      const data: ChatResponse = await this.ollama.chat({ ...chatRequest, stream: false })
      return format ? data : data.message.content
    } catch (error: unknown) {
      this.handleError(error)
      return null
    }
  }

  /**
   * Creates a configured service instance.
   * @description Applies authentication for remote services or basic configuration for local instances
   * @returns Promise that resolves to a configured service instance
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
        LogHandler.handleConfigError(error, 'getInstance')
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
