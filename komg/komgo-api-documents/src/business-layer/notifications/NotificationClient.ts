import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { INotificationCreateRequest, NotificationManager } from '@komgo/notification-publisher'
import { axiosRetry, exponentialDelay } from '@komgo/retry'
import * as AxiosError from 'axios-error'
import { inject, injectable } from 'inversify'

import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/ErrorName'

import NotificationSendError from './NotificationSendError'

const NOT_FOUND_ERROR_CODE = 404

/**
 * Client to send notifications.
 */
@injectable()
export class NotificationClient {
  private readonly logger = getLogger('NotificationClient')

  constructor(
    @inject(TYPES.NotificationManager) private readonly notificationManager: NotificationManager,
    private readonly retryDelay = 1000
  ) {}

  /**
   * Send a notification to a user
   * @param notification notification to send
   * @throws NotificationSendError if fails to send a notification
   */
  public async sendNotification(notification: INotificationCreateRequest): Promise<void> {
    try {
      this.logger.info('Sending notification')
      await axiosRetry(async () => this.notificationManager.createNotification(notification), {
        delay: exponentialDelay(this.retryDelay)
      })
    } catch (error) {
      const axiosError = new AxiosError(error)
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorName.NotificationError,
        'Error calling the Notifications API',
        { code: axiosError.message, axiosResponse: this.getResponse(axiosError) }
      )

      if (this.roleNotFound(axiosError)) {
        this.logger.warn(
          ErrorCode.ConnectionMicroservice,
          ErrorName.NotificationError,
          'Attempted to send notification, role not found',
          { context: notification.context }
        )
        return
      }
      throw new NotificationSendError(`Failed to send notification. ${error.message}`)
    }
  }
  private roleNotFound(axiosError: AxiosError): boolean {
    return axiosError.response.status === NOT_FOUND_ERROR_CODE
  }

  private getResponse(error: AxiosError): any {
    if (error.response) return error.response.data
    return '<none>'
  }
}
