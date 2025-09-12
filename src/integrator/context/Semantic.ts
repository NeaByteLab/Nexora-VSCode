import * as vscode from 'vscode'
import { SemanticSegment } from '@interfaces/index'

/**
 * Provides utilities for retrieving semantic tokens from documents.
 * Semantic tokens contain information about the syntax highlighting and
 * semantic meaning of code elements in a document.
 */
export default class SemanticToken {
  /**
   * Retrieves semantic tokens for the entire document.
   *
   * @param editor - The text editor containing the document
   * @returns Promise that resolves to semantic tokens for the full document
   */
  public static async getFullDocument(
    editor: vscode.TextEditor
  ): Promise<vscode.ProviderResult<vscode.SemanticTokens>> {
    return vscode.commands.executeCommand<vscode.SemanticTokens>(
      'vscode.provideDocumentSemanticTokens',
      editor.document.uri
    )
  }

  /**
   * Retrieves semantic tokens for a specific range within the document.
   *
   * @param editor - The text editor containing the document
   * @param selection - The range of text to get semantic tokens for
   * @returns Promise that resolves to semantic tokens for the specified range
   */
  public static async getRangeDocument(
    editor: vscode.TextEditor,
    selection: vscode.Selection
  ): Promise<vscode.ProviderResult<vscode.SemanticTokens>> {
    return vscode.commands.executeCommand<vscode.SemanticTokens>(
      'vscode.provideDocumentRangeSemanticTokens',
      editor.document.uri,
      selection
    )
  }

  /**
   * Formats semantic tokens into a readable string representation.
   *
   * @param tokens - Array of semantic token segments to format
   * @returns Formatted string with token information
   */
  public static formatTokens(tokens: Array<SemanticSegment>): string {
    return tokens
      .map((token: SemanticSegment) => {
        const startLine: number = token.range.start.line + 1
        const startCharacter: number = token.range.start.character + 1
        const endCharacter: number = token.range.end.character + 1
        const tokenModifiers: string = token.tokenModifiers.join(', ')
        return `[Line:${startLine}:${startCharacter}-${endCharacter}] \`${token.text}\` (Modifiers: ${tokenModifiers}) @ Type: ${token.tokenType}`
      })
      .join('\n- ')
  }

  /**
   * Decodes semantic tokens data into readable format with text and metadata.
   *
   * @param tokens - The semantic tokens to decode
   * @param document - The document containing the tokens
   * @returns Array of decoded token objects
   */
  public static decodeTokens(
    tokens: vscode.SemanticTokens,
    document: vscode.TextDocument
  ): Array<SemanticSegment> {
    const { data }: { data: Uint32Array } = tokens
    const result: Array<SemanticSegment> = []
    let line: number = 0
    let character: number = 0
    for (let i: number = 0; i < data.length; i += 5) {
      const deltaLine: number = data[i] ?? 0
      const deltaCharacter: number = data[i + 1] ?? 0
      const length: number = data[i + 2] ?? 0
      const tokenType: number = data[i + 3] ?? 0
      const tokenModifiers: number = data[i + 4] ?? 0
      line += deltaLine
      character = deltaLine === 0 ? character + deltaCharacter : (deltaCharacter ?? 0)
      const startPos: vscode.Position = new vscode.Position(line, character ?? 0)
      const endPos: vscode.Position = new vscode.Position(line, character + length)
      const range: vscode.Range = new vscode.Range(startPos, endPos)
      const text: string = document.getText(range)
      result.push({
        text,
        tokenType: this.getTokenTypeName(tokenType),
        tokenModifiers: this.getTokenModifiers(tokenModifiers),
        range
      })
    }
    return result
  }

  /**
   * Converts token type index to readable name.
   *
   * @param tokenType - Numeric index of the token type
   * @returns String name of the token type
   */
  private static getTokenTypeName(tokenType: number): string {
    const tokenTypes: string[] = [
      'namespace',
      'class',
      'interface',
      'enum',
      'struct',
      'typeParameter',
      'type',
      'parameter',
      'variable',
      'property',
      'enumMember',
      'decorator',
      'event',
      'function',
      'method',
      'macro',
      'label',
      'comment',
      'string',
      'keyword',
      'number',
      'regexp',
      'operator'
    ]
    return tokenTypes[tokenType] ?? 'unknown'
  }

  /**
   * Converts token modifiers bitmask to array of modifier names.
   *
   * @param tokenModifiers - Bitmask representing active modifiers
   * @returns Array of modifier names
   */
  private static getTokenModifiers(tokenModifiers: number): string[] {
    const modifiers: string[] = [
      'declaration',
      'definition',
      'readonly',
      'static',
      'deprecated',
      'abstract',
      'async',
      'modification',
      'documentation',
      'defaultLibrary'
    ]
    const result: string[] = []
    for (let i: number = 0; i < modifiers.length; i++) {
      if (tokenModifiers & (1 << i)) {
        result.push(modifiers[i] ?? '')
      }
    }
    return result
  }
}
