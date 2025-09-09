import { ChatResponse } from 'ollama'
import { CompletionResult } from '@interfaces/index'
import { OllamaService } from '@services/index'
import { StatusBarItem } from '@integrator/index'
import { ErrorHandler } from '@utils/index'
import { configSection } from '@constants/index'

/**
 * Tests the availability of the model service
 * @description Sends a test prompt to the service and displays the response in a notification
 * @param ollamaService - Service instance for testing
 * @returns Promise that resolves when the test is complete
 */
export default async function (ollamaService: OllamaService): Promise<void> {
  const statusBarItem: StatusBarItem = StatusBarItem.getInstance()
  statusBarItem?.show('$(loading~spin) Testing Endpoint...')
  const resCompletion: ChatResponse | CompletionResult = await ollamaService.generateCompletion(
    'User running tests the availability of the service, please respond with a simple message max 10 words'
  )
  if (typeof resCompletion === 'string' && resCompletion.length > 0) {
    const cleanResponse: string | undefined = resCompletion.split('</think>')[1] ?? resCompletion
    ErrorHandler.showNotification(`${configSection}: ${cleanResponse}`, 'info')
  }
  statusBarItem?.hide()
}
