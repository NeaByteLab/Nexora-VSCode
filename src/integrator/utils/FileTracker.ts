import { FileTrackerData } from '@interfaces/index'

/**
 * File tracker utility for tracking file changes.
 * @description Provides methods to set and get file tracker data.
 * Uses Singleton pattern to prevent duplicate file tracker instances.
 */
export default class FileTracker {
  /** Singleton instance of the file tracker */
  private static instance: FileTracker | undefined
  /** File tracker data organized by file URI */
  private readonly fileTrackers: Map<string, FileTrackerData[]> = new Map()
  /** Maximum entries per file to prevent memory overflow */
  private readonly MAX_ENTRIES_PER_FILE: number = 20

  /**
   * Private constructor to prevent direct instantiation.
   * @description Enforces singleton pattern by making constructor private
   */
  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Gets the singleton instance of FileTracker.
   * @description Creates a new instance if none exists, otherwise returns the existing instance
   * @returns The singleton FileTracker instance
   */
  public static getInstance(): FileTracker {
    FileTracker.instance ??= new FileTracker()
    return FileTracker.instance
  }

  /**
   * Gets the total count of stored file tracker data.
   * @description Counts all file tracker entries across all files
   * @returns Number of stored file tracker data across all files
   */
  public count(): number {
    let total: number = 0
    for (const fileEntries of this.fileTrackers.values()) {
      total += fileEntries.length
    }
    return total
  }

  /**
   * Gets the latest file tracker data for a specific file URI.
   * @param fileUri - The file URI to get data for
   * @returns The latest file tracker data for the file or empty object if not found
   * @description Retrieves the most recent file tracker entry for the specified file
   */
  public get(fileUri?: string): FileTrackerData {
    if (fileUri === undefined || fileUri === '') {
      const allEntries: FileTrackerData[] = this.getAll()
      return allEntries.length > 0
        ? (allEntries[allEntries.length - 1] as FileTrackerData)
        : ({} as FileTrackerData)
    }
    const fileEntries: FileTrackerData[] | undefined = this.fileTrackers.get(fileUri)
    if (fileEntries === undefined || fileEntries.length === 0) {
      return {} as FileTrackerData
    }
    const latest: FileTrackerData = fileEntries[fileEntries.length - 1] as FileTrackerData
    return latest
  }

  /**
   * Sets the file tracker data for a specific file URI.
   * @param fileTracker - The file tracker data to set
   * @description Stores file tracker data and automatically limits to MAX_ENTRIES_PER_FILE per file
   */
  public set(fileTracker: FileTrackerData): void {
    const { fileUri }: { fileUri: string } = fileTracker
    if (fileUri === '' || !fileUri) {
      return
    }
    let fileEntries: FileTrackerData[] = this.fileTrackers.get(fileUri) ?? []
    fileEntries.push(fileTracker)
    if (fileEntries.length > this.MAX_ENTRIES_PER_FILE) {
      fileEntries = fileEntries.slice(-this.MAX_ENTRIES_PER_FILE)
    }
    this.fileTrackers.set(fileUri, fileEntries)
  }

  /**
   * Clears all file tracker data.
   * @description Removes all file tracker entries from all files
   */
  public clear(): void {
    this.fileTrackers.clear()
  }

  /**
   * Clears file tracker data for a specific file URI.
   * @param fileUri - The file URI to clear data for
   * @description Removes all file tracker entries for the specified file
   */
  public clearFile(fileUri: string): void {
    this.fileTrackers.delete(fileUri)
  }

  /**
   * Gets all file tracker data for a specific file URI.
   * @param fileUri - The file URI to get data for
   * @returns Array of file tracker data for the file
   * @description Retrieves all file tracker entries for the specified file
   */
  public getFileData(fileUri: string): FileTrackerData[] {
    const fileEntries: FileTrackerData[] | undefined = this.fileTrackers.get(fileUri)
    return fileEntries ? [...fileEntries] : []
  }

  /**
   * Gets all file tracker data from all files.
   * @returns Array of all file tracker data
   * @description Retrieves all file tracker entries from all files
   */
  public getAll(): FileTrackerData[] {
    const allEntries: FileTrackerData[] = []
    for (const fileEntries of this.fileTrackers.values()) {
      allEntries.push(...fileEntries)
    }
    return allEntries
  }
}
