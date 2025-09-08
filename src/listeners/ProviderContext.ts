import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { ChatResponse } from 'ollama'
import { OllamaService } from '@services/index'
import { CompletionResult } from '@interfaces/index'

/**
 * Schema for code generation response format
 * @description Defines the structure for validating code generation responses
 */
const generationSchema: z.ZodEffects<
  z.ZodObject<{
    lineStart: z.ZodNumber
    lineEnd: z.ZodNumber
    content: z.ZodString
  }>
> = z
  .object({
    lineStart: z.number().int().min(1).describe('Starting line number for line-based editing'),
    lineEnd: z.number().int().min(1).describe('Ending line number for line-based editing'),
    content: z.string().describe('Content to write to the file for code suggestion and completion')
  })
  .refine((data: { lineStart: number; lineEnd: number }) => data.lineStart <= data.lineEnd, {
    message: 'lineStart must be less than or equal to lineEnd',
    path: ['lineStart']
  })

/**
 * JSON schema format for code generation
 * @description Converts Zod schema to JSON schema format for model communication
 */
const generationFormat: object = zodToJsonSchema(generationSchema)

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
      const validatedData: z.infer<typeof generationSchema> = generationSchema.parse(parsedContent)
      console.log('Validated structured response:', validatedData)
    } catch {
      // Skip Error Handling
    }
  }
}
