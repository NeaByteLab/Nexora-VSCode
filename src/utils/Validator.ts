import * as path from 'path'
import * as fs from 'fs'

/**
 * Validation utility class
 * Provides common validation methods
 */
export default class Validator {
  /** Valid service domains for URL validation */
  private static readonly SERVICE_DOMAINS: string[] = ['ollama.com', 'www.ollama.com']

  /**
   * Checks if a string is a valid service URL
   * @param url - URL string to validate
   * @returns True if the URL is valid, false otherwise
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
      return this.SERVICE_DOMAINS.some((domain: string) => hostname === domain)
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
      const dir: string = path.dirname(dbPath)
      return fs.existsSync(dir)
    } catch {
      return false
    }
  }
}
