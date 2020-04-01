import { injectable } from 'inversify'

import { NotificationRepo } from '../data-abstracts/repositories/notification'

import { INotificationCreateRequest, INotificationPatchIsRead } from '../../service-layer/request/notification'
import { INotification } from '../../service-layer/responses/notification'

import { INotificationDataAgent } from './interfaces/INotificationDataAgent'
import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'

/**
 * NotificationDataAgent Class: contains all Notification object related methods
 * @export
 * @class NotificationDataAgent
 */
@injectable()
export default class NotificationDataAgent implements INotificationDataAgent {
  async createNotification(notification: INotificationCreateRequest): Promise<INotification> {
    const newNotificationResult = await NotificationRepo.create(notification)

    if (newNotificationResult.errors) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'Database could not process the request.'
      )
    }

    return newNotificationResult
  }

  async getNotifications(userId: string, offset?: number, limit?: number): Promise<INotification[]> {
    let result = NotificationRepo.find({ toUser: userId }, null, { sort: { createdAt: -1 } })
    if (offset) result = result.skip(offset)
    if (limit) result = result.limit(limit)
    return result
  }

  async getNotificationsCount(userId: string, unreadOnly: boolean = false): Promise<number> {
    const filter = unreadOnly ? { toUser: userId, isRead: false } : { toUser: userId }
    return NotificationRepo.count(filter)
  }

  async getNotificationById(id: string): Promise<INotification> {
    const result = await NotificationRepo.findOne({ _id: id }).exec()
    if (!result) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Notification not found')
    }
    return result
  }

  updateNotificationIsRead(id: string, { isRead }: INotificationPatchIsRead): Promise<void> {
    return NotificationRepo.update({ _id: id }, { $set: { isRead } }).exec()
  }

  findAndUpdateNotificationsIsRead(toUser: string, { isRead }: INotificationPatchIsRead): Promise<void> {
    return NotificationRepo.updateMany({ toUser }, { $set: { isRead } }).exec()
  }
}
