import * as _ from 'lodash'
import { Readable, Duplex } from 'stream'

export type IClassType<T> = new (...args: any[]) => T

/**
 * Get all values for a string enum type.
 * @export
 * @param {object} enumType string enum type to get values from
 * @returns {string[]} values from an enum type
 */
export function enumValues(enumType: object): string[] {
  const keys = Object.keys(enumType)
  return keys.map(key => enumType[key])
}

export function deepCopy(obj: object): object {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Checks if all items in an array are unique
 * @param arr array of items to check
 * @returns true if all items are unique, false otherwise
 */
export function allUnique(arr: string[]): boolean {
  const set = {}
  for (const item of arr) {
    if (item in set) {
      return false
    }
    set[item] = true
  }

  return true
}

/**
 * Execute an async function on all items in an array in parallel
 *
 * @param arr an array to execute the function on
 * @param f a function to run in parallel on all items of the array
 */
export async function forEachAsyncParallel<T>(arr: T[], f: (T) => Promise<void>): Promise<void> {
  await Promise.all(
    arr.map(item => {
      return f(item)
    })
  )
}

/**
 * Execute an async function on all items in an array
 *
 * @param arr an array to execute the function on
 * @param f a function to run in parallel on all items of the array
 */
export async function forEachAsync<T>(arr: T[], f: (T) => Promise<void>) {
  for (const t of arr) {
    await f(t)
  }
}

export function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers = []
    stream.on('error', reject)
    stream.on('data', data => buffers.push(data))
    stream.on('end', () => resolve(Buffer.concat(buffers)))
  })
}

export function bufferToStream(buffer) {
  const stream = new Duplex()
  stream.push(buffer)
  stream.push(null)
  return stream
}

export function isFirstContainedInSecond(arr1: string[], arr2: string[]): boolean {
  return _.difference(arr1, arr2).length === 0
}

export function doIdsMatch(arr1: string[], arr2: string[]): boolean {
  return isFirstContainedInSecond(arr1, arr2) && isFirstContainedInSecond(arr2, arr1)
}
