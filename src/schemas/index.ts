import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

/**
 * Schema for code generation response format.
 * @description Defines the structure for validating code generation responses
 */
export const generationSchema: z.ZodObject<{
  type: z.ZodString
  lineIndex: z.ZodNumber
  oldContent: z.ZodString
  newContent: z.ZodString
  title: z.ZodString
}> = z.object({
  /** Type of the generation */
  type: z.string().min(1).describe('Type of the generation'),
  /** Line index of the generation */
  lineIndex: z.number().int().min(1).describe('Line index of the generation'),
  /** Old content of the generation */
  oldContent: z.string().min(1).describe('Old content of the generation'),
  /** New content of the generation */
  newContent: z.string().min(1).describe('New content of the generation'),
  /** Descriptive title of the code suggestion */
  title: z.string().min(1).describe('Descriptive title of the code suggestion')
})

/**
 * JSON schema format for code generation.
 * @description Converts Zod schema to JSON schema format
 */
export const generationFormat: object = zodToJsonSchema(generationSchema)
