import { z } from 'zod'
import { ChatResponse } from 'ollama'
import { CompletionResult, GenerationResult } from '@interfaces/index'
import { generationSchema } from '@schemas/index'
import { OllamaService } from '@services/index'
import { ErrorHandler } from '@utils/index'
import { configSection } from '@constants/index'

/**
 * Tests the availability of the model service
 * Sends a test prompt to the service and displays the response in a notification.
 * @param ollamaService - Service instance for testing
 */
export default async function (ollamaService: OllamaService): Promise<void> {
  const resCompletion: ChatResponse | CompletionResult = await ollamaService.generateCompletion(
    'User running tests the availability of the service, please respond with a simple message max 10 words'
  )
  if (typeof resCompletion === 'object' && resCompletion !== null && 'message' in resCompletion) {
    const chatResponse: ChatResponse = resCompletion
    try {
      const parsedContent: object = JSON.parse(chatResponse.message.content) as object
      const validatedData: GenerationResult = (generationSchema as z.ZodSchema).parse(
        parsedContent
      ) as GenerationResult
      ErrorHandler.showNotification(`${configSection}: ${validatedData.content}`, 'info')
    } catch {
      // Skip Error Handling
    }
  }
  if (typeof resCompletion === 'string' && resCompletion.length > 0) {
    const cleanResponse: string | undefined = resCompletion.split('</think>')[1] ?? resCompletion
    ErrorHandler.showNotification(`${configSection}: ${cleanResponse}`, 'info')
  }
}
