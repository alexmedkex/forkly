import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'
import { INotification } from '../responses/notification'
import { NotificationLevel } from '../request/notification'
import NotificationDataAgent from '../../data-layer/data-agents/NotificationDataAgent'
import { mock, sleep } from '../../utils/test-utils'
import { ErrorName } from '../utils/ErrorName'

const mockDecode = jest.fn(() => ({ sub: '5b2d3ca0ea4565010563acaf' }))
jest.mock('../../data-layer/utils/decodeBearerToken', () => ({
  decodeBearerToken: mockDecode
}))

const getUserIDsByPermissionMock = jest.fn(async () => ['test', 'test1'])
const getUserByIdMock: any = jest.fn(async () => ({
  id: 'test',
  firstName: 'test',
  lastName: 'test',
  username: 'test',
  createdAt: 0,
  email: 'test@example.com'
}))
jest.mock('../../data-layer/utils/getUsersByPermission', () => ({
  getUsersByPermission: jest.fn(async () => [{ id: 'test' }, { id: 'test1' }]),
  getUserIDsByPermission: getUserIDsByPermissionMock,
  getUserById: getUserByIdMock
}))

jest.mock('@komgo/logging', () => {
  const loggerMock = { error: jest.fn(), info: jest.fn() }
  return { getLogger: () => loggerMock }
})

const testNotif: INotification = {
  _id: 'notif-id',
  productId: 'product-id',
  type: 'type',
  createdAt: new Date('2019-01-01'),
  level: NotificationLevel.info,
  isRead: true,
  toUser: '5b2d3ca0ea4565010563acaf',
  context: { type: 'CL' },
  message: 'message'
}

const rabbitChannelMock: any = {
  publish: jest.fn()
}

const rabbitChannelInternalMock: any = {
  publish: jest.fn()
}

let getUserSettingsById: any = jest.fn(async () => ({ data: { sendTaskNotificationsByEmail: true } }))
jest.mock('../../data-layer/utils/getUserSettingsById', () => ({
  getUserSettingsById
}))

import { NotificationsController } from './NotificationsController'
import { IEmailService, EmailService } from '../../business-layer/emails/EmailService'
import { buildEmailTemplate, EmailType } from '../../business-layer/emails/templates/template'

describe('NotificationsController', () => {
  let notificationDataAgent: any
  let notificationsController: any
  let emailService: IEmailService

  beforeEach(() => {
    jest.clearAllMocks()

    notificationDataAgent = mock(NotificationDataAgent)
    emailService = new EmailService(rabbitChannelInternalMock, true)
    notificationsController = new NotificationsController(notificationDataAgent, rabbitChannelMock, emailService)

    notificationDataAgent.createNotification.mockReturnValue(testNotif)
    notificationDataAgent.getNotifications.mockReturnValue([testNotif])
    notificationDataAgent.getNotificationsCount.mockReturnValue(1)
    notificationDataAgent.getNotificationById.mockReturnValue(testNotif)
  })

  it('should create notifications using toUser and return it', async () => {
    const result = await notificationsController.CreateNewNotification({ toUser: 'testId' })
    expect(result).toEqual([testNotif])
  })

  it('should create notifications using requiredPermission and return it', async () => {
    const result = await notificationsController.CreateNewNotification({
      requiredPermission: { productId: 'test', actionId: 'test' }
    })

    expect(result).toEqual([testNotif, testNotif])
  })

  it('should throw error on creating notification', async () => {
    await expect(notificationsController.CreateNewNotification({})).rejects.toEqual(
      ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'Either "toUser" or "requiredPermission" should be passed'
      )
    )
  })

  it('should return notifications', async () => {
    const result = await notificationsController.GetNotifications('authorization token')

    expect(result).toEqual({ total: 1, unread: 1, notifications: [testNotif] })
  })

  it('should return notification by id', async () => {
    const result = await notificationsController.GetNotificationById('authorization token')

    expect(result).toEqual(testNotif)
  })

  it('should throw an error on get notification by id', async () => {
    mockDecode.mockReturnValueOnce({ sub: 'different-user' })

    await expect(notificationsController.GetNotificationById('authorization token')).rejects.toEqual(
      ErrorUtils.forbiddenException(
        ErrorCode.ValidationHttpContent,
        "You don't have permissions to view this notification"
      )
    )
  })

  it('should call updateNotificationIsRead', async () => {
    await notificationsController.UpdateNotifIsRead('authorization token')

    expect(notificationDataAgent.updateNotificationIsRead).toHaveBeenCalled()
  })

  it('should throw an error on update notifications', async () => {
    mockDecode.mockReturnValueOnce({ sub: 'different-user' })

    await expect(notificationsController.UpdateNotifIsRead('authorization token')).rejects.toEqual(
      ErrorUtils.forbiddenException(
        ErrorCode.ValidationHttpContent,
        "You don't have permissions to update this notification"
      )
    )
  })

  it('should call findAndUpdateNotificationsIsRead', async () => {
    await notificationsController.UpdateNotifsIsRead('authorization token')

    expect(notificationDataAgent.findAndUpdateNotificationsIsRead).toHaveBeenCalled()
  })

  it('should throw error if notification creation fails', async () => {
    notificationDataAgent.createNotification.mockRejectedValue(new Error('Oops!'))

    await expect(notificationsController.CreateNewNotification({ toUser: 'abc123' })).rejects.toEqual(
      new Error('Oops!')
    )
  })

  it('logs error if publish fails', async () => {
    const getLogger = (await require('@komgo/logging')).getLogger
    const logError = getLogger().error
    rabbitChannelMock.publish.mockRejectedValue(new Error('Oops!'))

    await notificationsController.CreateNewNotification({ toUser: 'abc123' })
    await sleep(1)

    expect(logError).toHaveBeenCalledWith(
      ErrorCode.ConnectionInternalMQ,
      ErrorName.publishMessageFailed,
      'Oops!',
      expect.any(Object)
    )
  })

  it('should publish notification to WS queue on creation', async () => {
    emailService.isEmailEnabled = jest.fn(() => Promise.resolve(true))
    notificationDataAgent.createNotification.mockReturnValue(testNotif)

    await notificationsController.CreateNewNotification({
      toUser: 'abc123',
      emailData: {
        subject: 'test subject',
        taskTitle: 'title',
        taskLink: `http://link`
      }
    })

    expect(rabbitChannelInternalMock.publish).toHaveBeenCalledWith(
      'komgo.email-notification',
      {
        body: buildEmailTemplate({
          link: `http://link/${testNotif._id}`,
          linkTitle: 'title',
          type: EmailType.Notification
        }),
        recipients: ['test@example.com'],
        subject: 'test subject'
      },
      { recipientPlatform: 'email-notification' }
    )

    expect(rabbitChannelMock.publish).toHaveBeenCalledWith(
      'INTERNAL.WS.action',
      {
        payload: {
          _id: 'notif-id',
          context: { type: 'CL' },
          createdAt: new Date('2019-01-01T00:00:00.000Z'),
          isRead: true,
          level: 'info',
          message: 'message',
          productId: 'product-id',
          toUser: '5b2d3ca0ea4565010563acaf',
          type: 'type'
        },
        recipient: '5b2d3ca0ea4565010563acaf',
        type: '@@notif/GET_NOTIFICATION_SUCCESS',
        version: '1'
      },
      expect.any(Object)
    )
  })
})
