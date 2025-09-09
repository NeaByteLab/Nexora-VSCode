import { z } from 'zod'
import * as vscode from 'vscode'
import { GenerationResult, CompletionType } from '@interfaces/index'
import { ContextBuilder, StatusBarItem } from '@integrator/index'
import { OllamaService } from '@services/index'
import { generationSchema, generationFormat } from '@schemas/index'
import { ErrorHandler } from '@utils/index'

/**
 * Requests code generation from Ollama service.
 * @param context - The context string for code generation
 * @param format - The format object for the request
 * @param ollamaService - The Ollama service instance
 * @param type - The type of completion to generate
 * @returns Promise resolving to generation result or null if parsing fails
 */
export async function requestOllama(
  context: string,
  format: object,
  ollamaService: OllamaService,
  type: CompletionType
): Promise<GenerationResult | null> {
  try {
    const response: unknown = await ollamaService.generateCompletion(context, format, type)
    if (typeof response === 'object' && response !== null && 'message' in response) {
      const parsed: object = JSON.parse(
        (response as { message: { content: string } }).message.content
      ) as object
      const parseResponse: GenerationResult = (generationSchema as z.ZodSchema).parse(
        parsed
      ) as GenerationResult
      return parseResponse
    }
    return null
  } catch (error: unknown) {
    ErrorHandler.handle(error, 'requestOllama', false)
    return null
  }
}

/**
 * Generates code completion suggestions using AI service
 * @param document - The text document where completion is requested
 * @param position - The cursor position in the document
 * @param ollamaService - Service instance for AI model communication
 * @param statusBarItem - Status bar item for user feedback
 * @returns Promise resolving to generation result or null if generation fails
 */
export async function requestInlineCompletion(
  document: vscode.TextDocument,
  position: vscode.Position,
  ollamaService: OllamaService,
  statusBarItem: StatusBarItem
): Promise<GenerationResult | null> {
  try {
    const context: string = ContextBuilder.getUserPrompt(document, position)
    const result: GenerationResult | null = await requestOllama(
      context,
      generationFormat,
      ollamaService,
      'completion'
    )
    return result
  } catch (error: unknown) {
    ErrorHandler.handle(error, 'requestInlineCompletion', false)
    return null
  } finally {
    statusBarItem?.hide()
  }
}

/**
 * Generates lint fix suggestions using AI service.
 * @param document - The text document where lint fix is requested
 * @param position - The cursor position in the document
 * @param ollamaService - Service instance for AI model communication
 * @param lintIssue - The lint issue description to fix
 * @returns Promise resolving to generation result or null if generation fails
 */
export async function requestLintFix(
  document: vscode.TextDocument,
  position: vscode.Position,
  ollamaService: OllamaService,
  lintIssue: string
): Promise<GenerationResult | null> {
  try {
    const context: string = ContextBuilder.getUserPrompt(document, position, lintIssue)
    const result: GenerationResult | null = await requestOllama(
      context,
      generationFormat,
      ollamaService,
      'lint'
    )
    return result
  } catch (error: unknown) {
    ErrorHandler.handle(error, 'requestLintFix', false)
    return null
  }
}
