/**
 * Type definition for cache values
 * @description Defines the allowed types that can be stored in the cache
 */
type CacheResponse =
  | Array<{ name: string }>
  | boolean
  | null
  | number
  | Record<string, unknown>
  | string
  | string[]
  | undefined
  | unknown[]

/**
 * CacheManager provides a key-value cache with automatic eviction
 * @description Stores key-value pairs with a maximum size limit
 */
class CacheManager {
  /** Singleton instance */
  private static instance: CacheManager | null = null
  /** Internal cache storage */
  private readonly cache: Map<string, CacheResponse> = new Map()
  /** Maximum cache size */
  private readonly maxSize: number = 5000

  /**
   * Private constructor prevents direct instantiation
   * @description Enforces singleton pattern by making constructor private
   */
  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Returns the singleton instance of CacheManager
   * @description Creates a new instance if none exists, otherwise returns the existing instance
   * @returns The shared CacheManager instance
   */
  public static getInstance(): CacheManager {
    CacheManager.instance ??= new CacheManager()
    return CacheManager.instance
  }

  /**
   * Stores a value in the cache with the specified key
   * @param id - The unique identifier for the cached value
   * @param value - The value to store (must be of type CacheResponse)
   */
  public set(id: string, value: CacheResponse): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(id)) {
      this.evictOldest()
    }
    this.cache.set(id, value)
  }

  /**
   * Retrieves a value from the cache by its key
   * @param id - The unique identifier for the cached value
   * @returns The cached value or undefined if the key is not found
   */
  public get(id: string): CacheResponse {
    return this.cache.get(id)
  }

  /**
   * Removes the oldest entry from the cache
   * @description Automatically called when the cache reaches its maximum size limit
   */
  private evictOldest(): void {
    if (this.cache.size === 0) {
      return
    }
    const firstKey: string | undefined = this.cache.keys().next().value
    if (firstKey !== undefined) {
      this.cache.delete(firstKey)
    }
  }
}

/**
 * Exports the singleton CacheManager instance
 * @description Provides a single shared instance of CacheManager across the application
 */
export default CacheManager.getInstance()
