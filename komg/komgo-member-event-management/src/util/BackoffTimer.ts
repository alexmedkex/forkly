import logger from '@komgo/logging'
import { inject, injectable } from 'inversify'

import { sleep } from '../service-layer/IService'

import IBackoffTimer from './IBackoffTimer'

@injectable()
export default class BackoffTimer implements IBackoffTimer {
  private connectionErrorAttempt: number = 0

  constructor(
    @inject('common-broker-max-error-delay-ms') private readonly maxBackoffMs: number,
    private readonly incrementalBackoffMs: number = 500
  ) {}

  /**
   * Sleep for a determined time based on the backoff logic, which exponentially increases before is reset, until a max value
   */
  public async sleep(): Promise<number> {
    const calculatedDelay = Math.pow(2, this.connectionErrorAttempt++) * this.incrementalBackoffMs
    const delay = Math.min(calculatedDelay, this.maxBackoffMs)
    logger.info(`Back off for ${delay}ms.`)
    await sleep(delay)
    return delay
  }

  /**
   * Reset the backoff time
   */
  public reset() {
    this.connectionErrorAttempt = 0
  }
}
