import * as vscode from 'vscode'
import { FileContextData, CompletionType } from '@interfaces/index'
import { GetFileData } from '@integrator/context/index'

/**
 * Builds context strings for code generation requests.
 * Combines file data and diagnostic information into formatted context strings.
 */
class ContextBuilder {
  /**
   * Generates a user prompt with file context and diagnostic information.
   * @param document - The VS Code text document to analyze
   * @param position - The cursor position within the document
   * @param lintIssue - Optional lint issue to include in the context
   * @returns Formatted context string for code generation requests
   */
  public getUserPrompt(
    document: vscode.TextDocument,
    position: vscode.Position,
    lintIssue?: string
  ): string {
    const resultFileData: FileContextData = GetFileData(document, position)
    return this.getUserContext(resultFileData, lintIssue)
  }

  /**
   * Generates a system prompt with coding rules and response format requirements.
   * @param type - The type of completion to generate system prompt for
   * @returns System context string containing coding guidelines and response format specifications
   */
  public getSystemPrompt(type: CompletionType): string {
    const systemContext: string =
      type === 'lint' ? this.getLintSystemPrompt() : this.getCompletionSystemPrompt()
    return `${systemContext}

# IMPORTANT: Response Format
- Return ONLY the code without any additional text
- No markdown code blocks or formatting when returning the code

You must respond with valid JSON in the following format:
{
  "lineStart": number,
  "charStart": number,
  "lineEnd": number, 
  "charEnd": number,
  "content": "string",
  "title": "string"
}
`.trim()
  }

  /**
   * Generates a system prompt with linting rules and response format requirements.
   * @returns System context string containing linting guidelines and response format specifications
   */
  private getLintSystemPrompt(): string {
    return `You are a code linting assistant that can fix lint issues in the code.

# Rules You Must Follow
- Follow the existing code style and naming conventions
- Maintain consistency with the existing codebase
- Maintain proper indentation matching the surrounding code

Focus on fixing the lint issue, not creating new features.
`.trim()
  }

  /**
   * Generates a system prompt with completion rules and response format requirements.
   * @returns System context string containing completion guidelines and response format specifications
   */
  private getCompletionSystemPrompt(): string {
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
`.trim()
  }

  /**
   * Creates a formatted context string from file data and diagnostics.
   * @param context - Combined file context data containing file information and diagnostic metadata
   * @param lintIssue - Optional lint issue to include in the context
   * @returns Formatted context string with file details and diagnostic information
   */
  private getUserContext(context: FileContextData, lintIssue?: string): string {
    const lintSection: string =
      lintIssue != null && lintIssue.trim().length > 0 ? `# Lint Issue\n- ${lintIssue}` : ''
    const contextString: string = `
# Trigger Context
- File Path: ${context.fileData.filePath}
- Opening File: ${context.fileData.fileName} (${context.fileData.fileLanguageId})
- Total Lines: ${context.fileData.fileTotalLines}
- Selected Position: Line ${context.selectedData.selectedLineNumber}, Char ${context.selectedData.selectedCharacterPosition}
- Selected Line: "${context.selectedData.selectedLineText}"
- Is Dirty: ${context.fileData.fileIsDirty ? 'Yes' : 'No'}

${lintSection}

# Code Before Cursor
\`\`\`${context.fileData.fileLanguageId}
${context.selectedData.selectedTextBeforeCursor}
\`\`\`

# Code After Cursor
\`\`\`${context.fileData.fileLanguageId}
${context.selectedData.selectedTextAfterCursor}
\`\`\`
`.trim()
    return contextString
  }
}

/**
 * Singleton instance of ContextBuilder.
 * Provides a single instance of the ContextBuilder class for global access.
 */
export default new ContextBuilder()
