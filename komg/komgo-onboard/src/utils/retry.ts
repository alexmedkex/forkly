const MAX_RETRIES = 3
const DELAY = 1000
const MAX_JITTER = 100

const HTTP_ERROR_BASE = 100
const HTTP_SERVER_ERROR = 5

/**
 * Call a code method with exponential back off retry strategy.
 * @param code code to execute with retries
 * @param delay function that calculates a delay before the next retry
 * @param shouldRetry function that returns true if a code execution should be retried
 * @returns return the value of the first successful return of the "code" function
 * @throws the error that was thrown by the last unsuccessful "code" function execution
 */
export async function retry<T>(
  code: () => Promise<T>,
  delay: (retryNum: number) => number = exponentialDelay(DELAY),
  shouldRetry: (error) => boolean = () => true
): Promise<T> {
  let lastError

  for (let retryNum = 1; retryNum <= MAX_RETRIES; retryNum++) {
    try {
      return await code()
    } catch (error) {
      lastError = error
      if (!shouldRetry(error)) break
      await sleep(delay(retryNum))
    }
  }

  throw lastError
}

/**
 * Call an code that performs request using the "axios" library with exponential back off retry strategy.
 * @param code code that performs an HTTP request
 * @param delay function that calculates a delay before the next retry
 * @param shouldRetry function that returns true if a code execution should be retried
 * @returns return the value of the first successful return of the "code" function
 * @throws the error that was thrown by the last unsuccessful "code" function execution
 */
export async function axiosRetry<T>(
  code: () => Promise<T>,
  delay: (retryNum) => number = exponentialDelay(DELAY),
  shouldRetry: (error) => boolean = isServerError
): Promise<T> {
  return retry(code, delay, shouldRetry)
}

/**
 * Check we can retry on an error that was thrown by an "axios" HTTP request.
 * It makes sense to retry a request if an error happened on a server since it may
 * be caused by a temporary issue. Repeating a call after client error does not
 * make sense since since all subsequent requests will fail.
 *
 * @param error error thrown by "axios" call
 * @returns true if an error was a server error
 */
export function isServerError(error) {
  return !error.response || error.response.status / HTTP_ERROR_BASE === HTTP_SERVER_ERROR
}

export function exponentialDelay(delay: number = DELAY) {
  return (retryNum: number) => {
    return delay * retryNum ** 2 + jitter(Math.min(delay, MAX_JITTER))
  }
}

function jitter(maxJitter: number): number {
  return -maxJitter + 2 * Math.random() * maxJitter
}

function sleep(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms))
}
