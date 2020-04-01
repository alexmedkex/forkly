export default class RetryableError extends Error {
  constructor(error: string)
  constructor(public readonly error: Error | string) {
    super(error instanceof Error ? error.message : error)
  }
}
