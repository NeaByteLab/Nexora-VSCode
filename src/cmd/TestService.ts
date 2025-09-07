import { CompletionResult } from '@interfaces/index'
import { OllamaService } from '@services/index'
import { ErrorHandler } from '@utils/index'
import { configSection } from '@constants/index'

/**
 * Tests the availability of the model service
 * @param ollamaService - Service instance for testing
 */
export default async function (ollamaService: OllamaService): Promise<void> {
  const resCompletion: CompletionResult = await ollamaService.generateCompletion(
    'User running tests the availability of the service, please respond with a simple message max 10 words'
  )
  if (typeof resCompletion == 'string' && resCompletion.length > 0) {
    const cleanResponse: string | undefined = resCompletion.split('</think>')[1] ?? resCompletion
    ErrorHandler.showNotification(`${configSection}: ${cleanResponse}`, 'info')
  }
}
