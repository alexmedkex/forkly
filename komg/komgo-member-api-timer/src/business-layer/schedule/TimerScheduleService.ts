import { ErrorCode } from '@komgo/error-utilities'
import logger, { getLogger } from '@komgo/logging'
import { inject, injectable, multiInject } from 'inversify'

import { ITimerDataAgent } from '../../data-layer/data-agents/ITimerDataAgent'
import { ITimer } from '../../data-layer/models/ITimer'
import { TimerDataStatus } from '../../data-layer/models/TimerDataStatus'
import { TimerStatus } from '../../data-layer/models/TimerStatus'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/Constants'
import { Metric, TimerState } from '../../utils/Metrics'

import { ITimerScheduleProcessor } from './TimerScheduleProcessor'

export interface ITimerScheduleService {
  start(): Promise<void>
  stopTimer(staticId: string, status: TimerStatus): Promise<void>
  scheduleJobs(staticId: string): Promise<void>
}

@injectable()
export class TimerScheduleService implements ITimerScheduleService {
  private readonly logger = getLogger('TimerScheduleService')

  constructor(
    @inject(TYPES.TimerDataAgent) private readonly timerDataAgent: ITimerDataAgent,
    @inject(TYPES.TimerScheduleProcessor) private readonly processor: ITimerScheduleProcessor
  ) {}

  public async start() {
    const timers = await this.timerDataAgent.find(
      {
        status: TimerStatus.InProgress
      },
      null
    )
    await Promise.all(
      timers.map(timer => {
        this.createTimerJobs(timer)
      })
    )
  }

  public async stopTimer(staticId: string, status: TimerStatus) {
    const timerJobStatus = this.mapTimerStatus(status)
    const timer = await this.timerDataAgent.get(staticId)
    Promise.all(
      timer.timerData.map(async timerData => {
        await this.processor.stopTimerJob(timer, timerData, timerJobStatus)
      })
    )
    await this.processor.cleanUpTimerJobs(timer.staticId)
    await this.timerDataAgent.updateStatus(staticId, status)
    this.logger.metric({
      [Metric.TimerState]: TimerState.Stopped
    })
    this.logger.info('Timer jobs stopped', {
      timerStaticId: timer.staticId
    })
  }

  public async scheduleJobs(staticId: string) {
    const timer = await this.timerDataAgent.get(staticId)
    if (!timer) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.MissingTimerData, {
        timerStaticId: staticId
      })
    }

    await this.createTimerJobs(timer)
    if (
      timer.status !== TimerStatus.InProgress &&
      timer.timerData &&
      !timer.timerData.every(action => action.status !== TimerDataStatus.Pending)
    ) {
      await this.timerDataAgent.updateStatus(timer.staticId, TimerStatus.InProgress)
    }
  }

  private async createTimerJobs(timer: ITimer) {
    if (timer.timerData) {
      timer.timerData.forEach(timerData => {
        if (timerData.status === TimerDataStatus.Pending) {
          this.processor.scheduleJob(timer, timerData)
        }
      })
      this.logger.metric({
        [Metric.TimerState]: TimerState.Active
      })
    }

    this.logger.info('Timer jobs scheduled', {
      timerStaticId: timer.staticId
    })
  }

  private mapTimerStatus(timerStatus: TimerStatus): TimerDataStatus {
    switch (timerStatus) {
      case TimerStatus.Cancelled:
        return TimerDataStatus.Cancelled
      case TimerStatus.Closed:
        return TimerDataStatus.Closed
      case TimerStatus.Completed:
        return TimerDataStatus.Completed
      case TimerStatus.InProgress:
        return TimerDataStatus.Pending
      default:
        return TimerDataStatus.Cancelled
    }
  }
}
