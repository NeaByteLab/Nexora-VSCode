/**
 * Represents a single operation in a diff sequence
 * @description Defines one operation in the Myers diff algorithm result
 */
export interface DiffOperation {
  /** The type of operation: equal, delete, or insert */
  type: 'equal' | 'delete' | 'insert'
  /** Starting position in the old sequence */
  oldStart: number
  /** Ending position in the old sequence */
  oldEnd: number
  /** Starting position in the new sequence */
  newStart: number
  /** Ending position in the new sequence */
  newEnd: number
  /** The content lines involved in this operation */
  content: string[]
}

/**
 * Contains the complete result of a diff computation
 * @description Represents the full result of the Myers diff algorithm computation
 */
export interface DiffResult {
  /** Array of diff operations describing the changes */
  operations: DiffOperation[]
  /** Length of the original sequence */
  oldLength: number
  /** Length of the new sequence */
  newLength: number
  /** Minimum number of operations needed to transform old to new */
  editDistance: number
}
