import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable, multiInject } from 'inversify'
import * as moment from 'moment'
import * as schedule from 'node-schedule'

import { ITimerDataAgent } from '../../data-layer/data-agents/ITimerDataAgent'
import { ITimer } from '../../data-layer/models/ITimer'
import { ITImerData } from '../../data-layer/models/ITimerData'
import { ITimerExecutionLog } from '../../data-layer/models/ITimerExecutionLog'
import { TimerDataStatus } from '../../data-layer/models/TimerDataStatus'
import { TimerStatus } from '../../data-layer/models/TimerStatus'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/Constants'
import { Metric, TimerActionStatus, TimerActionExecutionStatus } from '../../utils/Metrics'

import { IJobPayload } from './IJobPayload'
import { ITimerJobProcessorBase } from './ITimerJobProcessor'
import { ITimerJobData } from './TimerJobData'

export interface ITimerScheduleProcessor {
  scheduleJob(timer: ITimer, timerData: ITImerData, time?: Date)
  stopTimerJob(timer: ITimer, timerData: ITImerData, status: TimerDataStatus)
  cleanUpTimerJobs(staticId: string)
}

@injectable()
export class TimerScheduleProcessor implements ITimerScheduleProcessor {
  private readonly logger = getLogger('TimerScheduleProcessor')

  private readonly processors: Map<string, ITimerJobProcessorBase> = new Map<string, ITimerJobProcessorBase>()

  constructor(
    @inject(TYPES.TimerDataAgent) private readonly timerDataAgent: ITimerDataAgent,
    @inject('timerRetryNumber') private readonly retryNumber: number,
    @inject('timerRetryTime') private readonly retryTime: number,
    @multiInject(TYPES.TimerJobProcessor) processors: ITimerJobProcessorBase[]
  ) {
    processors.forEach(p => this.addJobProcessor(p))
  }

  public async scheduleJob(timer: ITimer, timerData: ITImerData, time?: Date) {
    try {
      const jobName = this.getTimerJobName(timer, timerData)
      schedule.scheduleJob(
        jobName,
        this.getTimerJobTime(time || timerData.time),
        this.executeTimer.bind(this, this.createTimerJobData(timer, timerData))
      )
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.JobScheduleError, {
        timerStaticId: timer.staticId,
        timerId: timerData.timerId,
        err: err.message,
        errorObject: err
      })
      throw err
    }
    this.logger.metric({
      [Metric.TimerActionStatus]: TimerActionStatus.Registered
    })
    this.logger.info('Timer job scheduled', {
      timerStaticId: timer.staticId,
      timerId: timerData.timerId
    })
  }

  public async stopTimerJob(timer: ITimer, timerData: ITImerData, status: TimerDataStatus) {
    if (timerData.status === TimerDataStatus.Pending) {
      try {
        const jobName = this.getTimerJobName(timer, timerData)
        await schedule.cancelJob(jobName)
        await this.updateTimerDataStatus(timer, timerData.timerId, status)
        this.logger.info('Timer job stopped', {
          timerStaticId: timer.staticId,
          timerId: timerData.timerId
        })
      } catch (err) {
        this.logger.error(ErrorCode.UnexpectedError, ErrorName.JobCancelError, {
          timerStaticId: timer.staticId,
          timerId: timerData.timerId,
          err: err.message,
          errorObject: err
        })
        throw err
      }
    }
  }

  public async cleanUpTimerJobs(staticId: string) {
    try {
      const timer = await this.timerDataAgent.get(staticId)
      const timerScheduledJobs = Object.keys(schedule.scheduledJobs).filter(key => key.startsWith(timer.staticId))
      await Promise.all(
        timerScheduledJobs.map(async jobName => {
          await schedule.cancelJob(jobName)
          this.logger.info('Timer job canceled', {
            jobName
          })
        })
      )
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.JobCancelError, {
        timerStaticId: staticId,
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  private async executeTimer(jobData: ITimerJobData, executionTime) {
    const timer = await this.timerDataAgent.get(jobData.timerStaticId)
    if (!timer) {
      this.logger.error(
        ErrorCode.UnexpectedError,
        ErrorName.TimerJobMissingData,
        this.createJobLogContext(jobData, executionTime)
      )
      return
    }
    const scheduledJob = timer.timerData.find(x => x.timerId === jobData.timerId)
    if (!scheduledJob) {
      this.logger.error(
        ErrorCode.UnexpectedError,
        ErrorName.TimerJobMissingData,
        this.createJobLogContext(jobData, executionTime)
      )
      return
    }
    this.logger.info('Timer job triggered', {
      timerStaticId: timer.staticId,
      timerId: jobData.timerId
    })

    const success = await this.executeTimerJob(jobData, executionTime)
    await this.addExecutionLog(timer, jobData, success)
    if (success) {
      await this.markJobCompleted(timer, jobData.timerId)
    } else {
      await this.markFailedJob(timer, jobData.timerId)
    }

    if (timer.timerData.every(data => data.status !== TimerDataStatus.Pending)) {
      await this.timerDataAgent.updateStatus(jobData.timerStaticId, TimerStatus.Completed)
      this.logger.info('Timer completed', {
        timerStaticId: timer.staticId
      })
    }
  }

  private async executeTimerJob(jobData: ITimerJobData, executionTime: Date) {
    this.logger.info('Executing timer job', this.createJobLogContext(jobData, executionTime))
    const payload = jobData.payload as IJobPayload

    if (!payload) {
      this.logger.warn(
        ErrorCode.UnexpectedError,
        ErrorName.JobProcessorNotFound,
        this.createJobLogContext(jobData, executionTime)
      )
      return true
    }

    const processor = this.processors[payload.jobType]
    if (!processor) {
      this.logger.warn(
        ErrorCode.UnexpectedError,
        ErrorName.JobPayloadEmpty,
        this.createJobLogContext(jobData, executionTime)
      )
      return true
    }

    try {
      await processor.executeJob(payload)
    } catch (error) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.TimerJobExecutionError, {
        ...this.createJobLogContext(jobData, executionTime),
        erroroMessage: error.message,
        errorObject: error
      })

      return false
    }
    return true
  }

  private async markJobCompleted(timer: ITimer, timerId: string) {
    this.logger.info('Timer job completed successfully', {
      timerStaticId: timer.staticId,
      timerId
    })
    await this.updateTimerDataStatus(timer, timerId, TimerDataStatus.Completed)
    this.logger.metric({
      [Metric.TimerActionExecution]: TimerActionExecutionStatus.Success
    })
  }

  private async markFailedJob(timer: ITimer, timerId: string) {
    this.logger.info('Timer job failed', {
      timerStaticId: timer.staticId,
      timerId
    })
    this.logger.metric({
      [Metric.TimerActionExecution]: TimerActionExecutionStatus.Failed
    })
    const index = timer.timerData.findIndex(job => job.timerId === timerId)
    const timerData = timer.timerData[index]
    timerData.retry++
    await this.timerDataAgent.updateField(timer.staticId, `timerData.${index}.retry`, timerData.retry)
    if (timerData.retry >= this.retryNumber) {
      await this.updateTimerDataStatus(timer, timerId, TimerDataStatus.Failed)
      return
    }

    this.scheduleJob(
      timer,
      timerData,
      moment()
        .add(this.retryTime, 'minutes')
        .toDate()
    )
  }

  private async addExecutionLog(timer: ITimer, jobData: ITimerJobData, success: boolean) {
    const index = timer.timerData.findIndex(job => job.timerId === jobData.timerId)
    const executionLog: ITimerExecutionLog = {
      executionTime: moment().toDate(),
      scheduledTime: jobData.time,
      context: timer.context,
      payload: jobData.payload,
      success
    }
    await this.timerDataAgent.updatePushArray(timer.staticId, `timerData.${index}.executionLog`, executionLog)
  }

  private createJobLogContext(jobData: ITimerJobData, executionTime: Date) {
    return {
      timerStaticId: jobData.timerStaticId,
      timerId: jobData.timerId,
      scheduledTime: jobData.time,
      context: jobData.context,
      executionTime
    }
  }

  private createTimerJobData(timer: ITimer, timerData: ITImerData): ITimerJobData {
    return {
      timerStaticId: timer.staticId,
      context: timer.context,
      time: timerData.time,
      timerId: timerData.timerId,
      payload: timerData.payload
    }
  }

  private async updateTimerDataStatus(timer: ITimer, timerId: string, status: TimerDataStatus) {
    const index = timer.timerData.findIndex(timerData => timerId === timerData.timerId)
    if (index >= 0) {
      const timerData = timer.timerData[index]
      timerData.status = status
      await this.timerDataAgent.updateField(timer.staticId, `timerData.${index}.status`, status)
    }
  }

  private getTimerJobTime(date: Date) {
    if (moment(date) < moment()) {
      return moment()
        .add(10, 'seconds')
        .toDate()
    }
    return date
  }

  private getTimerJobName(timer: ITimer, timerData: ITImerData): string {
    return `${timer.staticId}-timerId-${timerData.timerId}`
  }

  private addJobProcessor(processor: ITimerJobProcessorBase) {
    this.processors[processor.timerJobType] = processor
    this.logger.info('Registered events processor for message type', { messageType: processor.timerJobType })
  }
}
