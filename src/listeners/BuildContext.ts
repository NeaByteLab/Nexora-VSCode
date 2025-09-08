import { FileContextData } from '@interfaces/index'

/**
 * Creates a context string from file data and diagnostics
 * @description Generates a formatted context string for code generation requests
 * @param context - File context data containing file information and metadata
 * @param errorCount - Number of errors in the current file
 * @param warningCount - Number of warnings in the current file
 * @param diagnostics - Diagnostic messages from the language server
 * @param codeBefore - Code content before the current cursor position (30 lines)
 * @param codeAfter - Code content after the current cursor position (30 lines)
 * @returns Context string with template variables replaced by current system information
 */
export function buildUserContext(
  context: FileContextData,
  errorCount: number,
  warningCount: number,
  diagnostics: string,
  codeBefore: string,
  codeAfter: string
): string {
  const contextString: string = `
# Trigger Context
- File: ${context.fileName} (${context.languageId})
- Path: ${context.filePath}
- Position: Line ${context.lineNumber}, Char ${context.characterPosition}
- Current Line: "${context.currentLineText}"
- Total Lines: ${context.totalLines}
- Is Dirty: ${context.isDirty}
- Errors: ${errorCount}, Warnings: ${warningCount}

# Diagnostics
${diagnostics || 'No diagnostics found'}

# Code Before Cursor (30 lines before current line)
\`\`\`${context.languageId}
${codeBefore}
\`\`\`

# Code After Cursor (30 lines after current line)
\`\`\`${context.languageId}
${codeAfter}
\`\`\`
`.trim()
  return contextString
}

/**
 * Creates a system context string for AI model instructions
 * @description Generates a formatted context string with system rules and response format requirements
 * @returns System context string with AI agent instructions and response format specifications
 */
export function buildSystemContext(): string {
  return `You are AI Agent that can create code auto completion & code generation.

# Rules you must follow
- Follow the existing code style and naming conventions
- Maintain consistency with the existing codebase
- Maintain proper indentation matching the surrounding code
- If code already good, keep it as is
- Don't reformat unrelated code
- Write only necessary, high-quality code
- Use best practices and clean code principles
- Provide clear, readable solutions
- Prefer multi-line over one-liners/complex ternaries
- Include appropriate error handling if completing functions/methods
- Only add imports if absolutely necessary for the completion

# IMPORTANT: Response Format
- Return ONLY the code
- No explanations, comments, or additional text
- No markdown code blocks or formatting
- Just the raw code that should replace or complete the current position

You must respond with valid JSON in the following format:
{
  "lineStart": number,
  "lineEnd": number, 
  "filePath": "string",
  "content": "string"
}
`.trim()
}
