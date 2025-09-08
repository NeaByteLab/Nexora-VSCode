import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

/**
 * Schema for code generation response format
 * @description Defines the structure for validating code generation responses with line-based editing support
 */
export const generationSchema: z.ZodEffects<
  z.ZodObject<{
    lineStart: z.ZodNumber
    charStart: z.ZodNumber
    lineEnd: z.ZodNumber
    charEnd: z.ZodNumber
    content: z.ZodString
    title: z.ZodString
  }>
> = z
  .object({
    /** Starting line number for code insertion (1-based index) */
    lineStart: z.number().int().min(1).describe('Starting line number for code insertion'),
    /** Starting character position for code insertion (0-based index) */
    charStart: z.number().int().min(0).describe('Starting character position for code insertion'),
    /** Ending line number for code replacement (1-based index) */
    lineEnd: z.number().int().min(1).describe('Ending line number for code replacement'),
    /** Ending character position for code replacement (0-based index) */
    charEnd: z.number().int().min(0).describe('Ending character position for code replacement'),
    /** Generated code content to insert */
    content: z.string().min(10).max(1000).describe('Generated code content to insert'),
    /** Descriptive title of the code suggestion */
    title: z.string().min(10).max(50).describe('Descriptive title of the code suggestion')
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
