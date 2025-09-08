import { FileContextData } from '@interfaces/index'

/**
 * Creates a context string from file data and diagnostics
 *
 * @param context - File context data containing file information and metadata
 * @param errorCount - Number of errors in the current file
 * @param warningCount - Number of warnings in the current file
 * @param diagnostics - Diagnostic messages from the language server
 * @param codeBefore - Code content before the current cursor position (30 lines)
 * @param codeAfter - Code content after the current cursor position (30 lines)
 * @returns Context string with template variables replaced by current system information
 */
export default function (
  context: FileContextData,
  errorCount: number,
  warningCount: number,
  diagnostics: string,
  codeBefore: string,
  codeAfter: string
): string {
  const contextString: string = `
You are AI Agent that can create code auto completion & code generation.

# Rules you must follow
- Follow the existing code style and naming conventions
- Use best practices and clean code principles
- Write only necessary, high-quality code
- Maintain consistency with the existing codebase
- Provide clear, readable solutions

# Trigger context
- File: ${context.fileName} (${context.languageId})
- Path: ${context.filePath}
- Position: Line ${context.lineNumber}, Char ${context.characterPosition}
- Current Line: "${context.currentLineText}"
- Total Lines: ${context.totalLines}
- Is Dirty: ${context.isDirty}
- Errors: ${errorCount}, Warnings: ${warningCount}

# Diagnostics
${diagnostics || 'No diagnostics found'}

# Code before cursor (30 lines before current line)
\`\`\`${context.languageId}
${codeBefore}
\`\`\`

# Code after cursor (30 lines after current line)
\`\`\`${context.languageId}
${codeAfter}
\`\`\`
`.trim()
  return contextString
}
