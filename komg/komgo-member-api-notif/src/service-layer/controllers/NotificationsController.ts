import { Body, Controller, Get, Header, Patch, Path, Post, Query, Route, Response, Security, Tags } from 'tsoa'
import { requestStorageInstance, ErrorUtils } from '@komgo/microservice-config'
import { getLogger } from '@komgo/logging'
import { IUser } from '@komgo/types'

import { INotificationDataAgent } from '../../data-layer/data-agents/interfaces/INotificationDataAgent'
import { getUsers } from '../../data-layer/utils/getUsers'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { INotificationCreateRequest, INotificationPatchIsRead } from '../request/notification'
import { INotification, INotificationResponse } from '../responses/notification'
import { decodeBearerToken, IDecodedJWT } from '../../data-layer/utils/decodeBearerToken'
import { getUsersByPermission } from '../../data-layer/utils/getUsersByPermission'
import { IMessagePublisher } from '@komgo/messaging-library'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../utils/ErrorName'
import { IEmailService } from '../../business-layer/emails/EmailService'

const requiredFieldIsMissing = 'required field is missing'

const invalidJwtToken = 'invalid jwt token'

/**
 * Notification Routes Class
 * @export
 * @class NotificationsController
 * @extends {Controller}
 */
@Tags('Notifications')
@Route('notifications')
@provideSingleton(NotificationsController)
export class NotificationsController extends Controller {
  private readonly logger = getLogger('NotificationsController')

  constructor(
    @inject(TYPES.NotificationDataAgent) private readonly notificationDataAgent: INotificationDataAgent,
    @inject(TYPES.MessagePublisher) private readonly messagePublisher: IMessagePublisher,
    @inject(TYPES.EmailService) private readonly emailService: IEmailService
  ) {
    super()
  }

  /**
   * @summary creates a new notification
   */
  @Security('internal')
  @Response('400', requiredFieldIsMissing)
  @Response('422', 'toUser or requiredPermission is missing')
  @Post()
  public async CreateNewNotification(@Body() request: INotificationCreateRequest): Promise<INotification[]> {
    const sendWSNotification = async (notificationPromise: Promise<INotification>): Promise<void> => {
      let recipient: string
      let payload: INotification
      const type = '@@notif/GET_NOTIFICATION_SUCCESS'
      const requestId = requestStorageInstance.get('requestId')
      try {
        payload = await notificationPromise
        recipient = payload.toUser
      } catch (e) {
        this.logger.error(ErrorCode.ConnectionDatabase, ErrorName.notificationCreationError, e.message, {
          stacktrace: e.stack
        })
        return
      }
      try {
        await this.messagePublisher.publish(
          'INTERNAL.WS.action',
          { recipient, type, version: '1', payload },
          { requestId }
        )
      } catch (e) {
        this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.publishMessageFailed, e.message, {
          notifId: payload._id.toString(),
          stacktrace: e.stack,
          requestId
        })
      }
    }

    if (request.toUser) {
      const users = await getUsers(request.toUser)
      const notificationPromise: Promise<INotification> = this.notificationDataAgent.createNotification(request)
      sendWSNotification(notificationPromise)
      const notification = await notificationPromise
      await this.emailService.sendNotificationEmail(users, request.emailData, notification)
      return [notification]
    }

    if (request.requiredPermission) {
      const users = await getUsersByPermission(request.requiredPermission)
      return Promise.all(
        users.map(
          async (user: IUser): Promise<INotification> => {
            const notificationPromise: Promise<INotification> = this.notificationDataAgent.createNotification({
              ...request,
              toUser: user.id
            })
            sendWSNotification(notificationPromise)
            const notification = await notificationPromise
            await this.emailService.sendNotificationEmail([user], request.emailData, notification)
            return notification
          }
        )
      )
    }

    throw ErrorUtils.unprocessableEntityException(
      ErrorCode.ValidationHttpContent,
      `Either "toUser" or "requiredPermission" should be passed`
    )
  }

  /**
   * @summary returns notifications
   */
  @Security('signedIn')
  @Response('400', requiredFieldIsMissing)
  @Response('400', invalidJwtToken)
  @Get()
  public async GetNotifications(
    @Header('Authorization') authHeader: string,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10
  ): Promise<INotificationResponse> {
    const jwt: IDecodedJWT = decodeBearerToken(authHeader)
    const userId: string = jwt.sub
    return {
      total: await this.notificationDataAgent.getNotificationsCount(userId, false),
      unread: await this.notificationDataAgent.getNotificationsCount(userId, true),
      notifications: await this.notificationDataAgent.getNotifications(userId, offset, limit)
    }
  }

  /**
   * @summary returns notification by notifId
   */
  @Security('signedIn')
  @Response('400', requiredFieldIsMissing)
  @Response('400', invalidJwtToken)
  @Get('{notifId}')
  public async GetNotificationById(
    @Header('Authorization') authHeader: string,
    @Path() notifId: string
  ): Promise<INotification> {
    const jwt: IDecodedJWT = decodeBearerToken(authHeader)
    const userId: string = jwt.sub
    const notification = await this.notificationDataAgent.getNotificationById(notifId)

    if (userId !== notification.toUser) {
      throw ErrorUtils.forbiddenException(
        ErrorCode.ValidationHttpContent,
        "You don't have permissions to view this notification"
      )
    }

    return notification
  }

  /**
   * @summary marks certain notification as read
   */
  @Security('signedIn')
  @Response('400', requiredFieldIsMissing)
  @Response('400', invalidJwtToken)
  @Patch('is-read/{notifId}')
  public async UpdateNotifIsRead(
    @Header('Authorization') authHeader: string,
    @Path() notifId: string,
    @Body() req: INotificationPatchIsRead
  ): Promise<void> {
    const jwt: IDecodedJWT = decodeBearerToken(authHeader)
    const userId: string = jwt.sub

    const notification: INotification = await this.notificationDataAgent.getNotificationById(notifId)
    if (userId !== notification.toUser) {
      throw ErrorUtils.forbiddenException(
        ErrorCode.ValidationHttpContent,
        "You don't have permissions to update this notification"
      )
    }

    await this.notificationDataAgent.updateNotificationIsRead(notification._id, req)
    return
  }

  /**
   * @summary marks all notifications as read
   */
  @Security('signedIn')
  @Response('400', requiredFieldIsMissing)
  @Response('400', invalidJwtToken)
  @Patch('is-read')
  public async UpdateNotifsIsRead(
    @Header('Authorization') authHeader: string,
    @Body() req: INotificationPatchIsRead
  ): Promise<void> {
    const jwt: IDecodedJWT = decodeBearerToken(authHeader)
    const userId: string = jwt.sub
    await this.notificationDataAgent.findAndUpdateNotificationsIsRead(userId, req)
    return
  }
}
