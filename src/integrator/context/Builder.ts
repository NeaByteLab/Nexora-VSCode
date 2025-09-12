import * as vscode from 'vscode'
import { FileContextData, CompletionType } from '@interfaces/index'
import { GetFileData } from '@integrator/context/index'

/**
 * Builds context strings for code generation and linting requests.
 * Combines file data and diagnostic information into formatted context strings.
 */
class ContextBuilder {
  /**
   * Generates a user prompt with file context and diagnostic information.
   * @param document - The text document to analyze
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

# Guidelines
- Selected position is where the user is, you can edit or add code before or after the selected position
- If you want to edit or add the code, make sure not to duplicate the existing code
- Line index must be the line number where the code should be added or edited
- Type 'edit' will indicate that you should edit the existing code (existing code exists or for improvement)
- Type 'add' will indicate that you should add the new code (new code does not exist in the file)
- If type 'add' you can keep 'oldContent' using 'none' value
- If type 'edit' you must provide the 'oldContent' and 'newContent'
- If nothing to change please set value type to 'none'
- Don't add existing code to 'newContent', just set type to 'none' if nothing to change

## Example with type 'edit'
{
  "type": "edit",
  "lineIndex": 1,
  "oldContent": "console.log('Hello, world!');",
  "newContent": "console.log('Hello, world! This is a test.');",
  "title": "Improve code readability"
}
## Other example with type 'edit'
{
  "type": "edit",
  "lineIndex": 10,
  "oldContent": "console.l);",
  "newContent": "console.log('Hello, world!');",
  "title": "Fix syntax error in the code"
}

## Example with type 'add'
{
  "type": "add",
  "lineIndex": 1,
  "oldContent": "none",
  "newContent": "console.log('Hello, world! This is a test.');",
  "title": "Add code to improve readability"
}

## Example with type 'none'
{
  "type": "none",
  "lineIndex": 1,
  "oldContent": "none",
  "newContent": "none",
  "title": "No change needed"
}

# IMPORTANT: Response Format
- You must respond with valid JSON in the following format
- Type must be one of the following: 'add', 'edit', 'none'
- You should truncate the code by nearest selected line number if the code is too long
- No markdown code blocks or formatting when returning the code

You must respond with valid JSON in the following format:
{
  "type": "add" | "edit" | "none",
  "lineIndex": number,
  "oldContent": string,
  "newContent": string,
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
- Support complex code structures (classes, interfaces, generics, etc)
- Create comprehensive solutions when needed for complex problems
- Don't add unnecessary code, only add code that is needed for the completion
- If code already good, keep it as is and set type to 'none'
`.trim()
  }

  /**
   * Creates a formatted context string from file data and diagnostics.
   * @param context - Combined file context data containing file information and diagnostic metadata
   * @param lintIssue - Optional lint issue to include in the context
   * @returns Formatted context string with file details and diagnostic information
   */
  private getUserContext(context: FileContextData, lintIssue?: string): string {
    const { fileData, selectedData }: FileContextData = context
    const lintSection: string =
      lintIssue != null && lintIssue.trim().length > 0 ? `# Lint Issue\n- ${lintIssue}` : ''
    const contextString: string = `
# Trigger Context
- File Path: ${fileData.filePath}
- Total Lines: ${fileData.fileTotalLines}
- Selected Position: [Ln:${selectedData.selectedLineNumber}] [Char:${selectedData.selectedCharacterPosition}]

${lintSection}

# Full Code Content
\`\`\`${fileData.fileLanguageId}\n${fileData.fileContent}\n\`\`\`
`.trim()
    return contextString
  }
}

/**
 * Singleton instance of ContextBuilder.
 * Provides a single instance of the ContextBuilder class for global access.
 */
export default new ContextBuilder()
