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

# Code Before Cursor
\`\`\`${context.languageId}
${codeBefore}
\`\`\`

# Code After Cursor
\`\`\`${context.languageId}
${codeAfter}
\`\`\`
`.trim()
  return contextString
}

/**
 * Creates a system context string for code generation instructions
 * @description Generates a formatted context string with coding rules and response format requirements
 * @returns System context string with coding guidelines and response format specifications
 */
export function buildSystemContext(): string {
  return `You are a code generation assistant that can create code completions and generate code.

# Rules You Must Follow
- Follow the existing code style and naming conventions
- Maintain consistency with the existing codebase
- Maintain proper indentation matching the surrounding code
- Prefer multi-line over one-liners/complex ternaries
- Include appropriate error handling if completing functions/methods
- Use the latest ES6+ features (arrow functions, template literals, destructuring)
- Use modern TypeScript features (enums, optional chaining, nullish coalescing)
- Use functional programming principles (pure functions, immutability)
- Use best practices and clean code principles
- Support complex code structures (classes, interfaces, generics)
- Create comprehensive solutions when needed for complex problems
- If code already good, keep it as is

# IMPORTANT: Response Format
- Return ONLY the code without any additional text
- No markdown code blocks or formatting when returning the code

You must respond with valid JSON in the following format:
{
  "lineStart": number,
  "lineEnd": number, 
  "content": "string",
  "title": "string"
}
`.trim()
}
