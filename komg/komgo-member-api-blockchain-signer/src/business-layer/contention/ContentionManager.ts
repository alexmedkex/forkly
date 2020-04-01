import { getLogger } from '@komgo/logging'
import { Sema } from 'async-sema'

export default class ContentionManager {
  private readonly logger = getLogger('ContentionManager')
  private readonly semaphore: Sema
  private counter: number

  constructor(maxConcurrency: number) {
    this.semaphore = new Sema(maxConcurrency)
    this.counter = 0
  }

  public getWaitingTasks(): number {
    return this.semaphore.nrWaiting()
  }

  public async apply<T>(func: () => Promise<T>, waitOnSemaphoreTimeout: number = Number.MAX_SAFE_INTEGER): Promise<T> {
    // logging - capture timestamp before aquiring semaphore
    const startTime: [number, number] = process.hrtime()

    await this.semaphore.acquire()

    // logging - capture timestamp after aquiring semaphore and calculate duration
    const inSemaphoreTime: [number, number] = process.hrtime()
    const waitOnSemaphore = this.convertToMillis(process.hrtime(startTime))
    this.counter++
    const id = this.counter
    this.logger.debug(`[${id}|${this.counter}] aquired semaphore...`)

    try {
      if (waitOnSemaphore >= waitOnSemaphoreTimeout) {
        throw Error('Waited too long in contention manager')
      }

      return await func()
    } finally {
      const inSemaphore = this.convertToMillis(process.hrtime(inSemaphoreTime))
      const total = this.convertToMillis(process.hrtime(startTime))
      this.logger.info(`Using contention manager`, {
        id,
        durationMs: {
          waitOnSemaphore,
          inSemaphore,
          total
        },
        semaQueue: this.semaphore.nrWaiting()
      })
      this.logger.debug(`[${id}|${this.counter}] releasing semaphore...`)
      this.semaphore.release()
    }
  }

  private convertToMillis(hrTime: [number, number]) {
    return Math.round(hrTime[0] * 1000 + hrTime[1] / 1000000)
  }
}
