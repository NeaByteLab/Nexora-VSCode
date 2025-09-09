import { z } from 'zod'
import * as vscode from 'vscode'
import { GenerationResult } from '@interfaces/index'
import { ContextBuilder, StatusBarItem } from '@integrator/index'
import { OllamaService } from '@services/index'
import { generationSchema, generationFormat } from '@schemas/index'
import { ErrorHandler } from '@utils/index'

/**
 * Generates code completion suggestions using AI service
 * @param document - The text document where completion is requested
 * @param position - The cursor position in the document
 * @param ollamaService - Service instance for AI model communication
 * @param statusBarItem - Status bar item for user feedback
 * @returns Promise resolving to generation result or null if generation fails
 */
export default async function (
  document: vscode.TextDocument,
  position: vscode.Position,
  ollamaService: OllamaService,
  statusBarItem: StatusBarItem
): Promise<GenerationResult | null> {
  try {
    const context: string = ContextBuilder.getUserPrompt(document, position)
    const response: unknown = await ollamaService.generateCompletion(context, generationFormat)
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
    ErrorHandler.handle(error, 'generateCodeCompletion', false)
    return null
  } finally {
    statusBarItem?.hide()
  }
}
