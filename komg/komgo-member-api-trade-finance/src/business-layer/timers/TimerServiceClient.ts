import { axiosRetry, exponentialDelay } from '../../retry'
import { ITimerServiceClient } from './ITimerServiceClient'
import { inject, injectable } from 'inversify'
import { getLogger } from '@komgo/logging'
import axios from 'axios'
import { ICreateTimerRequest, ITimerResponse, ICreateTimerResponse } from './ITimer'
import { CONFIG } from '../../inversify/config'
import { MicroserviceConnectionException } from '../../exceptions'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'

@injectable()
export class TimerServiceClient implements ITimerServiceClient {
  private logger = getLogger('TimerServiceClient')
  constructor(
    @inject(CONFIG.TimerServiceUrl) private readonly timerServiceUrl: string,
    private readonly retryDelay: number = 1000
  ) {}

  async saveTimer(timer: ICreateTimerRequest): Promise<ICreateTimerResponse> {
    const url = `${this.timerServiceUrl}/v0/timers`
    try {
      const result = await axiosRetry(
        async () => axios.post<ICreateTimerResponse>(url, timer),
        exponentialDelay(this.retryDelay)
      )
      if (result.data) {
        return result.data
      }
      return null
    } catch (err) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.TimerServiceSaveTimerFailed,
        'Timer save failed',
        {
          errorObject: {
            code: err.error ? err.error.errorCode : null,
            message: err.error ? err.error.message : null
          }
        },
        new Error().stack
      )
      throw new MicroserviceConnectionException(`Timer creation failed.`)
    }
  }

  async fetchTimer(staticId: string): Promise<ITimerResponse> {
    const url = `${this.timerServiceUrl}/v0/timers/${staticId}`
    let result
    try {
      result = await axiosRetry(async () => axios.get<ITimerResponse>(url), exponentialDelay(this.retryDelay))
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.TimerFetchFailed,
        error.message,
        {
          code: error.error ? error.error.errorCode : null,
          message: error.error ? error.error.message : null
        },
        new Error().stack
      )
      throw new MicroserviceConnectionException('Failed to fetch timer.')
    }
    if (result && result.data) {
      return {
        submissionDateTime: result.data.submissionDateTime,
        timerData: result.data.timerData,
        status: result.data.status
      }
    }
    return null
  }

  async deactivateTimer(staticId: string): Promise<void> {
    const url = `${this.timerServiceUrl}/v0/timers/${staticId}/deactivate`
    try {
      this.logger.info('Timer service deactivation called')
      await axiosRetry(async () => axios.put<void>(url), exponentialDelay(this.retryDelay))
    } catch (err) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.TimerServiceDeactivateTimerFailed,
        {
          errorObject: {
            code: err.error ? err.error.errorCode : null,
            message: err.error ? err.error.message : null
          }
        },
        new Error().stack
      )
      throw new MicroserviceConnectionException(`Timer deactivated failed.`)
    }
  }
}
