import { DiffOperation, DiffResult } from '@interfaces/index'

/**
 * Implements the Myers diff algorithm for computing differences between two text sequences
 *
 * This class provides efficient computation of the shortest edit script between two sequences
 * using the O(ND) algorithm described by Eugene W. Myers.
 */
export default class MyersDiff {
  /** The original text split into lines */
  private readonly oldLines: string[]
  /** The new text split into lines */
  private readonly newLines: string[]
  /** Number of lines in the original text */
  private readonly oldLength: number
  /** Number of lines in the new text */
  private readonly newLength: number

  /**
   * Creates a new MyersDiff instance
   * @param oldText - The original text to compare
   * @param newText - The new text to compare against
   */
  constructor(oldText: string, newText: string) {
    this.oldLines = this.splitLines(oldText)
    this.newLines = this.splitLines(newText)
    this.oldLength = this.oldLines.length
    this.newLength = this.newLines.length
  }

  /**
   * Splits text into lines, preserving line endings
   * @param text - The text to split into lines
   * @returns Array of lines from the text
   */
  private splitLines(text: string): string[] {
    if (text === '') {
      return ['']
    }
    return text.split(/\r?\n/)
  }

  /**
   * Computes the diff using Myers algorithm
   * @returns The complete diff result with operations and statistics
   */
  public computeDiff(): DiffResult {
    if (this.oldLength === 0) {
      return this.createInsertResult(0, this.newLength)
    }
    if (this.newLength === 0) {
      return this.createDeleteResult(0, this.oldLength)
    }
    return this.runMyersAlgorithm()
  }

  /**
   * Runs the core Myers algorithm
   * @returns The diff result computed using the Myers algorithm
   */
  private runMyersAlgorithm(): DiffResult {
    const maxD: number = this.oldLength + this.newLength
    const v: number[] = Array.from({ length: 2 * maxD + 1 }, () => 0)
    const trace: number[][] = []
    for (let i: number = 0; i < v.length; i++) {
      v[i] = 0
    }
    for (let d: number = 0; d <= maxD; d++) {
      trace.push([...v])
      for (let k: number = -d; k <= d; k += 2) {
        const { x, y }: { x: number; y: number } = this.calculateXY(v, k, d)
        v[k] = x
        if (x >= this.oldLength && y >= this.newLength) {
          return this.buildDiff(trace, d)
        }
      }
    }
    return this.createReplaceResult()
  }

  /**
   * Calculates x and y coordinates for the algorithm
   * @param v - The V array from the Myers algorithm
   * @param k - The diagonal index
   * @param d - The current edit distance
   * @returns Object containing x and y coordinates
   */
  private calculateXY(v: number[], k: number, d: number): { x: number; y: number } {
    let x: number
    if (k === -d || (k !== d && (v[k - 1] ?? 0) < (v[k + 1] ?? 0))) {
      x = v[k + 1] ?? 0
    } else {
      x = (v[k - 1] ?? 0) + 1
    }
    let y: number = x - k
    while (x < this.oldLength && y < this.newLength && this.oldLines[x] === this.newLines[y]) {
      x++
      y++
    }
    return { x, y }
  }

  /**
   * Builds the diff result from the trace
   * @param trace - The trace array from the Myers algorithm
   * @param d - The final edit distance
   * @returns The complete diff result
   */
  private buildDiff(trace: number[][], d: number): DiffResult {
    const operations: DiffOperation[] = []
    let x: number = this.oldLength
    let y: number = this.newLength
    for (let i: number = d; i >= 0; i--) {
      const v: number[] | undefined = trace[i]
      if (!v) {
        continue
      }
      const k: number = x - y
      const prevK: number = this.calculatePrevK(v, k, i)
      const prevX: number | undefined = v[prevK]
      if (prevX === undefined) {
        continue
      }
      const prevY: number = prevX - prevK
      while (x > prevX && y > prevY) {
        x--
        y--
      }
      if (prevX < x) {
        operations.unshift({
          type: 'delete',
          oldStart: prevX,
          oldEnd: x,
          newStart: prevY,
          newEnd: prevY,
          content: this.oldLines.slice(prevX, x)
        })
      } else if (prevY < y) {
        operations.unshift({
          type: 'insert',
          oldStart: prevX,
          oldEnd: prevX,
          newStart: prevY,
          newEnd: y,
          content: this.newLines.slice(prevY, y)
        })
      }
      x = prevX
      y = prevY
    }
    this.addEqualOperations(operations)
    return {
      operations,
      oldLength: this.oldLength,
      newLength: this.newLength,
      editDistance: d
    }
  }

  /**
   * Calculates the previous k value
   * @param v - The V array from the Myers algorithm
   * @param k - The current diagonal index
   * @param i - The current iteration
   * @returns The previous k value
   */
  private calculatePrevK(v: number[], k: number, i: number): number {
    if (k === -i || (k !== i && (v[k - 1] ?? 0) < (v[k + 1] ?? 0))) {
      return k + 1
    }
    return k - 1
  }

  /**
   * Adds equal operations between different operations
   * @param operations - The operations array to modify
   */
  private addEqualOperations(operations: DiffOperation[]): void {
    const result: DiffOperation[] = []
    let oldPos: number = 0
    let newPos: number = 0
    for (const op of operations) {
      if (oldPos < op.oldStart || newPos < op.newStart) {
        const equalLength: number = Math.min(op.oldStart - oldPos, op.newStart - newPos)
        if (equalLength > 0) {
          result.push({
            type: 'equal',
            oldStart: oldPos,
            oldEnd: oldPos + equalLength,
            newStart: newPos,
            newEnd: newPos + equalLength,
            content: this.oldLines.slice(oldPos, oldPos + equalLength)
          })
        }
      }
      result.push(op)
      oldPos = op.oldEnd
      newPos = op.newEnd
    }
    if (oldPos < this.oldLength || newPos < this.newLength) {
      const equalLength: number = Math.min(this.oldLength - oldPos, this.newLength - newPos)
      if (equalLength > 0) {
        result.push({
          type: 'equal',
          oldStart: oldPos,
          oldEnd: oldPos + equalLength,
          newStart: newPos,
          newEnd: newPos + equalLength,
          content: this.oldLines.slice(oldPos, oldPos + equalLength)
        })
      }
    }
    operations.length = 0
    operations.push(...result)
  }

  /**
   * Creates a result for pure insertion
   * @param start - The starting position
   * @param length - The length of the insertion
   * @returns A diff result containing only insert operations
   */
  private createInsertResult(start: number, length: number): DiffResult {
    return {
      operations: [
        {
          type: 'insert',
          oldStart: start,
          oldEnd: start,
          newStart: start,
          newEnd: start + length,
          content: this.newLines.slice(start, start + length)
        }
      ],
      oldLength: this.oldLength,
      newLength: this.newLength,
      editDistance: length
    }
  }

  /**
   * Creates a result for pure deletion
   * @param start - The starting position
   * @param length - The length of the deletion
   * @returns A diff result containing only delete operations
   */
  private createDeleteResult(start: number, length: number): DiffResult {
    return {
      operations: [
        {
          type: 'delete',
          oldStart: start,
          oldEnd: start + length,
          newStart: start,
          newEnd: start,
          content: this.oldLines.slice(start, start + length)
        }
      ],
      oldLength: this.oldLength,
      newLength: this.newLength,
      editDistance: length
    }
  }

  /**
   * Creates a result for complete replacement
   * @returns A diff result containing delete and insert operations for complete replacement
   */
  private createReplaceResult(): DiffResult {
    return {
      operations: [
        {
          type: 'delete',
          oldStart: 0,
          oldEnd: this.oldLength,
          newStart: 0,
          newEnd: 0,
          content: this.oldLines
        },
        {
          type: 'insert',
          oldStart: 0,
          oldEnd: 0,
          newStart: 0,
          newEnd: this.newLength,
          content: this.newLines
        }
      ],
      oldLength: this.oldLength,
      newLength: this.newLength,
      editDistance: this.oldLength + this.newLength
    }
  }
}
