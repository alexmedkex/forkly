import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { TaskManager } from '@komgo/notification-publisher'
import { inject, injectable } from 'inversify'

import { TYPES } from '../../../inversify/types'
import { ErrorName } from '../../../utils/Constants'
import { ITimerJobProcessor } from '../ITimerJobProcessor'
import { ITaskJobPayload } from '../job-payload/ITaskJobPayload'
import { TIMER_JOB_TYPE } from '../TimerJobType'

@injectable()
export class TaskJobProcessor implements ITimerJobProcessor<ITaskJobPayload> {
  public readonly timerJobType = TIMER_JOB_TYPE.SendNotification
  private readonly logger = getLogger('TaskJobProcessor')
  constructor(@inject(TYPES.NotificationManagerClient) protected readonly taskManager: TaskManager) {}

  async executeJob(payload: ITaskJobPayload): Promise<boolean> {
    if (!payload.task) {
      this.logger.warn(ErrorCode.UnexpectedError, ErrorName.TaskRequestMissing)
      return Promise.resolve(false)
    }

    try {
      await this.taskManager.createTask(payload.task, payload.message)
    } catch (error) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.TaskCreationFailed, {
        erroroMessage: error.message,
        errorObject: error
      })
      throw error
    }
    return Promise.resolve(true)
  }
}
