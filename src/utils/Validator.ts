import * as path from 'path'
import * as fs from 'fs'

/**
 * Utility class for validation functions
 * Provides common validation methods for the extension
 */
export default class Validator {
  private static readonly OLLAMA_DOMAINS: string[] = ['ollama.com', 'www.ollama.com']

  /**
   * Checks if a string is a valid Ollama URL
   * @param url - URL string to validate
   * @returns True if the URL is a valid Ollama URL, false otherwise
   */
  public static isOllamaUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false
    }
    try {
      const urlObject: URL = new URL(url)
      if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
        return false
      }
      const hostname: string = urlObject.hostname.toLowerCase()
      return this.OLLAMA_DOMAINS.some((domain: string) => hostname === domain)
    } catch {
      return false
    }
  }

  /**
   * Checks if a string is a valid database path
   * @param dbPath - Database path string to validate
   * @returns True if the path is valid, false otherwise
   */
  public static isValidPath(dbPath: string): boolean {
    if (!dbPath || typeof dbPath !== 'string') {
      return false
    }
    if (dbPath.trim() === '') {
      return false
    }
    try {
      const expandedPath: string = dbPath.startsWith('~/')
        ? path.join(process.env['HOME'] ?? process.env['USERPROFILE'] ?? '', dbPath.slice(2))
        : dbPath
      if (!path.isAbsolute(expandedPath)) {
        return false
      }
      const dir: string = path.dirname(expandedPath)
      return fs.existsSync(dir)
    } catch {
      return false
    }
  }
}
