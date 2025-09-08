import { z } from 'zod'
import { ChatResponse } from 'ollama'
import { generationSchema, generationFormat } from '@schemas/index'
import { OllamaService } from '@services/index'
import { CompletionResult, GenerationResult } from '@interfaces/index'

/**
 * Processes code generation request and logs the response
 * @description Handles code generation requests and validates structured responses
 * @param ollamaService - Service instance for generating completions
 * @param prompt - Input prompt for code generation
 * @returns Promise that resolves when processing is complete
 */
export default async function (ollamaService: OllamaService, prompt: string): Promise<void> {
  const resCompletion: ChatResponse | CompletionResult = await ollamaService.generateCompletion(
    prompt,
    generationFormat
  )
  if (typeof resCompletion === 'object' && resCompletion !== null && 'message' in resCompletion) {
    const chatResponse: ChatResponse = resCompletion
    try {
      const parsedContent: object = JSON.parse(chatResponse.message.content) as object
      const validatedData: GenerationResult = (generationSchema as z.ZodSchema).parse(
        parsedContent
      ) as GenerationResult
      if (validatedData.content && validatedData.content.length > 0) {
        console.log('Content:', validatedData.content)
      }
    } catch {
      // Skip Error Handling
    }
  }
}
