import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

/**
 * Schema for code generation response format
 * @description Defines the structure for validating code generation responses
 */
export const generationSchema: z.ZodEffects<
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
export const generationFormat: object = zodToJsonSchema(generationSchema)
