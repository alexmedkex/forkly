import { NotificationManager, INotificationCreateRequest, NotificationLevel } from '@komgo/notification-publisher'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { TIMER_JOB_TYPE } from '../TimerJobType'

import { NotificationJobProcessor } from './NotificationJobProcessor'

let notificationJobProcessor: NotificationJobProcessor
let notificationClient: NotificationManager

const mockNotification: INotificationCreateRequest = {
  productId: 'productId',
  type: 'TaskType',
  level: NotificationLevel.danger,
  toUser: 'Users',
  message: 'string',
  context: {}
}

describe('NotificationJobProcessor', () => {
  beforeEach(() => {
    notificationClient = createMockInstance(NotificationManager)
    notificationJobProcessor = new NotificationJobProcessor(notificationClient)
  })

  it('create notification', async () => {
    expect(
      await notificationJobProcessor.executeJob({
        jobType: TIMER_JOB_TYPE.SendNotification,
        notification: mockNotification
      })
    ).toBeTruthy()
    expect(notificationClient.createNotification).toBeCalledWith(mockNotification)
  })

  it('missing notification', async () => {
    expect(
      await notificationJobProcessor.executeJob({ jobType: TIMER_JOB_TYPE.SendNotification, notification: null })
    ).toBeFalsy()
    expect(notificationClient.createNotification).not.toBeCalled()
  })

  it('failed notification', async () => {
    notificationClient.createNotification = jest.fn().mockImplementation(() => {
      throw new Error('Notification create error')
    })
    await expect(
      notificationJobProcessor.executeJob({
        jobType: TIMER_JOB_TYPE.SendNotification,
        notification: mockNotification
      })
    ).rejects.toEqual(new Error('Notification create error'))
  })
})
