import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

/**
 * Schema for code generation response format
 * @description Defines the structure for validating code generation responses with line-based editing support
 */
export const generationSchema: z.ZodEffects<
  z.ZodObject<{
    lineStart: z.ZodNumber
    lineEnd: z.ZodNumber
    content: z.ZodString
    title: z.ZodString
  }>
> = z
  .object({
    /** Starting line number for line-based editing (1-based index) */
    lineStart: z.number().int().min(1).describe('Starting line number for line-based editing'),
    /** Ending line number for line-based editing (1-based index) */
    lineEnd: z.number().int().min(1).describe('Ending line number for line-based editing'),
    /** Content to write to the file for code suggestion and completion */
    content: z.string().describe('Content to write to the file for code suggestion and completion'),
    /** Title of the code suggestion and completion */
    title: z.string().describe('Title of the code suggestion and completion')
  })
  /** Validates that lineStart is less than or equal to lineEnd */
  .refine((data: { lineStart: number; lineEnd: number }) => data.lineStart <= data.lineEnd, {
    message: 'lineStart must be less than or equal to lineEnd',
    path: ['lineStart']
  })

/**
 * JSON schema format for code generation
 * @description Converts Zod schema to JSON schema format for model communication and validation
 */
export const generationFormat: object = zodToJsonSchema(generationSchema)
