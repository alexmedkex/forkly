import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { NotificationManager } from '@komgo/notification-publisher'
import { inject, injectable } from 'inversify'

import { TYPES } from '../../../inversify/types'
import { ErrorName } from '../../../utils/Constants'
import { ITimerJobProcessor } from '../ITimerJobProcessor'
import { INotificationJobPayload } from '../job-payload/INotificationJobPayload'
import { TIMER_JOB_TYPE } from '../TimerJobType'

@injectable()
export class NotificationJobProcessor implements ITimerJobProcessor<INotificationJobPayload> {
  public readonly timerJobType = TIMER_JOB_TYPE.SendNotification
  private readonly logger = getLogger('NotificationJobProcessor')
  constructor(@inject(TYPES.NotificationManagerClient) protected readonly notificationManager: NotificationManager) {}

  async executeJob(payload: INotificationJobPayload): Promise<boolean> {
    if (!payload.notification) {
      this.logger.warn(ErrorCode.UnexpectedError, ErrorName.NotificationRequestMissing)
      return false
    }

    try {
      await this.notificationManager.createNotification(payload.notification)
    } catch (error) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.NotificationCreateFailed, {
        erroroMessage: error.message,
        errorObject: error
      })
      throw error
    }
    return Promise.resolve(true)
  }
}
