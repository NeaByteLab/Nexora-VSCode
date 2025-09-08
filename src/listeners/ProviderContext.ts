import * as vscode from 'vscode'
import { z } from 'zod'
import { ChatResponse } from 'ollama'
import { CompletionResult, GenerationResult } from '@interfaces/index'
import { generationSchema, generationFormat } from '@schemas/index'
import { InlineSuggestion } from '@listeners/index'
import { OllamaService } from '@services/index'

/**
 * Processes code generation request and applies suggestions
 * @description Handles code generation requests, validates responses, and applies changes to the editor
 * @param ollamaService - Service instance for generating completions
 * @param prompt - Input prompt for code generation
 * @param inlineSuggestion - Inline suggestion service for managing suggestions
 * @returns Promise that resolves when processing is complete
 */
export default async function (
  ollamaService: OllamaService,
  prompt: string,
  inlineSuggestion: InlineSuggestion
): Promise<void> {
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
        const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor
        if (activeEditor) {
          inlineSuggestion.showSuggestion(validatedData, activeEditor.document.fileName)
        }
      }
    } catch {
      // Skip Error Handler
    }
  }
}
