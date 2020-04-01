import { getLogger } from '@komgo/logging'

const logger = getLogger('WithRetries')
const sleep = async function(millis) {
  return new Promise(resolve => setTimeout(resolve, millis))
}

export function getOrElseBackoffStrategy(enVarName, defaultValue) {
  if (process.env[enVarName]) {
    return JSON.parse(process.env[enVarName])
  } else {
    return defaultValue
  }
}

/**
 * WithRetries method decorator.
 * @param maxRetries number of maximum retries
 * @param retryStrategy function that analyses the Error and determines if it should retry or not
 */
export function WithRetries<T extends Error>(
  maxRetries: number,
  backoffStrategy: number[] = [1000],
  retryStrategy: (T) => boolean = _ => true
) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = async function(...args: any[]) {
      return retry(
        propertyKey,
        maxRetries,
        async () => originalMethod.apply(this, args),
        retryStrategy,
        backoffStrategy
      )
    }
    return descriptor
  }
}

/**
 * Retry function
 * @param maxRetries number of maximum retries
 * @param func delegated function which, in case of failure, this function will analyse if it should retry.
 * @param retryCondition boolean expression that analyses thrown exception and determines if it should retry or not. Using default value means it will only retry until maxRetries
 * @param backoffStrategy an array of times to wait in milliseconds. E.g.: [1000, 2000, 3000] will await 1s on the first retry, 2s on the second, 3s on the following retries.
 */
export async function retry<T, U extends Error>(
  location: string,
  maxRetries: number,
  func: () => Promise<T>,
  retryCondition: (err: U) => boolean,
  backoffStrategy: number[]
): Promise<T> {
  for (let iter = 1; ; iter++) {
    try {
      return await func()
    } catch (err) {
      if (iter <= maxRetries && retryCondition(err)) {
        await handleErrorAndWait(maxRetries, iter, backoffStrategy, err, location)
      } else {
        throw err
      }
    }
  }
}

const handleErrorAndWait = async (
  maxRetries: number,
  iter: number,
  backoffStrategy: number[],
  err: Error,
  location: string
): Promise<void> => {
  const index = iter - 1
  const safeIndex = index < backoffStrategy.length ? index : backoffStrategy.length - 1
  const backoffMs = backoffStrategy[safeIndex]
  logger.info(`Got ${err.message} on '${location}' and now backing off ${backoffMs}ms`, {
    location,
    errorMessage: err.message,
    backoffMs,
    attempts: iter,
    maxRetries
  })
  await sleep(backoffMs)
  logger.info(`Retrying #${iter}`)
}
