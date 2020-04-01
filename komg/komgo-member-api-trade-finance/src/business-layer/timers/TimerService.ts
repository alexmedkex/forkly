import { inject, injectable } from 'inversify'
import { TYPES } from '../../inversify'
import { ITimerServiceClient } from './ITimerServiceClient'
import { ICreateTimerResponse, ITimerDataRequest } from './ITimer'
import { INotificationCreateRequest } from '@komgo/notification-publisher'
import { calculateDate } from './utils'
import { getLogger } from '@komgo/logging'
import { ITimerBase, TimerDurationUnit, TimerJobType, TimerStatus } from '@komgo/types'
import * as _ from 'lodash'

export interface ITimerService {
  createTimer(issuedDate: ITimerBase, notifications: ITimerNotification[], context?: any): Promise<ICreateTimerResponse>
  fetchTimer(timerStaticId): Promise<ITimerAdditionalData>
  deactivateTimer(timerStaticId: string): Promise<void>
}

export interface ITimerNotification {
  notification: INotificationCreateRequest
  factor: number
}

export interface ITimerAdditionalData {
  staticId: string
  time?: Date
  status?: TimerStatus
}

@injectable()
export class TimerService implements ITimerService {
  private logger = getLogger('TimerService')

  constructor(@inject(TYPES.TimerServiceClient) private readonly timerServiceClient: ITimerServiceClient) {}

  async createTimer(
    issueDueDate: ITimerBase,
    notifications: ITimerNotification[],
    context?: any
  ): Promise<ICreateTimerResponse> {
    try {
      const response = await this.timerServiceClient.saveTimer({
        duration: {
          duration: issueDueDate.duration,
          unit: issueDueDate.unit
        },
        timerData: this.createTimerData(issueDueDate.duration, issueDueDate.unit, notifications),
        timerType: issueDueDate.timerType,
        context
      })

      return response
    } catch (error) {
      this.logger.info('Timer save failed, continuing...')
    }
  }

  async fetchTimer(timerStaticId): Promise<ITimerAdditionalData> {
    try {
      const timer = await this.timerServiceClient.fetchTimer(timerStaticId)
      if (timer && timer.timerData) {
        const data = _.orderBy(timer.timerData, x => x.time).pop()
        const timerResponse: ITimerAdditionalData = {
          staticId: timerStaticId,
          time: data.time,
          status: timer.status as TimerStatus
        }
        return timerResponse
      }
    } catch (error) {
      this.logger.info('Featch timer failed')
    }
  }

  async deactivateTimer(timerStaticId: string): Promise<void> {
    if (timerStaticId) {
      await this.timerServiceClient.deactivateTimer(timerStaticId)
    }
  }

  private createTimerData(
    duration: number,
    unit: TimerDurationUnit,
    notifications: ITimerNotification[]
  ): ITimerDataRequest[] {
    return notifications.map(data => ({
      time: calculateDate(new Date(), unit, duration / data.factor),
      payload: {
        notification: data.notification,
        jobType: TimerJobType.sendNotification
      }
    }))
  }
}
