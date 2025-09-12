import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

/**
 * Type definition for the generation response.
 * @description Defines the structure for code generation responses with operation types and content
 */
export type GenerationResponse = {
  type: 'add' | 'edit' | 'delete' | 'none'
  oldContent: string
  newContent: string
  title: string
}

/**
 * Schema for code generation response format.
 * @description Defines the structure for validating code generation responses with operation type validation
 */
export const generationSchema: z.ZodType<GenerationResponse> = z
  .object({
    type: z.enum(['add', 'edit', 'delete', 'none']).describe('Type of the generation'),
    oldContent: z.string().describe('Old content of the generation'),
    newContent: z.string().describe('New content of the generation'),
    title: z.string().min(1).describe('Descriptive title of the code suggestion')
  })
  .refine(
    (data: GenerationResponse) => {
      if (data.type === 'add') {
        return data.oldContent === '' && data.newContent !== ''
      }
      if (data.type === 'edit') {
        return data.oldContent !== '' && data.newContent !== ''
      }
      if (data.type === 'delete') {
        return data.oldContent !== '' && data.newContent === ''
      }
      if (data.type === 'none') {
        return data.oldContent === '' && data.newContent === ''
      }
      return true
    },
    {
      message: 'Invalid combination based on the defined rules'
    }
  )

/**
 * JSON schema format for code generation.
 * @description Converts Zod schema to JSON schema format
 */
export const generationFormat: object = zodToJsonSchema(generationSchema)
