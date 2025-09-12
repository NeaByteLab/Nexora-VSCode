import { z } from 'zod'
import * as vscode from 'vscode'
import { GenerationResult, CompletionType } from '@interfaces/index'
import { ContextBuilder } from '@integrator/index'
import { OllamaService } from '@services/index'
import { generationSchema, generationFormat } from '@schemas/index'
import { LogHandler } from '@utils/index'

/**
 * Requests code generation from the text generation service.
 * @description Sends a request to the text generation service and parses the response into a structured format
 * @param context - The context string for code generation
 * @param format - The format object for the request
 * @param ollamaService - The text generation service instance
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
    LogHandler.handle(error, 'requestOllama', false, 'error')
    return null
  }
}

/**
 * Generates code completion suggestions using text generation service.
 * @description Creates inline code completion suggestions based on document context and cursor position
 * @param document - The text document where completion is requested
 * @param position - The cursor position in the document
 * @param ollamaService - Service instance for text generation communication
 * @returns Promise resolving to generation result or null if generation fails
 */
export async function requestInlineCompletion(
  document: vscode.TextDocument,
  position: vscode.Position,
  ollamaService: OllamaService
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
    LogHandler.handle(error, 'requestInlineCompletion', false, 'error')
    return null
  }
}

/**
 * Generates lint fix suggestions using text generation service.
 * @description Creates code suggestions to fix linting issues in the document
 * @param document - The text document where lint fix is requested
 * @param position - The cursor position in the document
 * @param ollamaService - Service instance for text generation communication
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
    LogHandler.handle(error, 'requestLintFix', false, 'error')
    return null
  }
}
