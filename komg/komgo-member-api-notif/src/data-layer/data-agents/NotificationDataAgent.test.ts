import 'reflect-metadata'

const mockNotification = {
  _id: '5b2d3ca0ea4565010563acaf',
  productId: 'productId',
  type: 'type',
  createdAt: new Date(),
  level: 'warning',
  isRead: false,
  toUser: '5b2d3ca0ea4565010563acaf',
  context: {},
  message: 'notification message'
}

const mockNotifications = {
  skip: jest.fn(() => mockNotifications),
  limit: jest.fn(() => mockNotifications)
}

const mockCreate = jest.fn(mockNotification => mockNotification)
const mockFind = jest.fn(() => mockNotifications)
const mockFindOne = jest.fn(() => ({
  exec: jest.fn().mockResolvedValueOnce(mockNotification)
}))
const mockUpdate = jest.fn(() => ({ exec: jest.fn() }))
const mockUpdateMany = jest.fn(() => ({ exec: jest.fn() }))
const mockCount = jest.fn(async () => 1)

jest.mock('../data-abstracts/repositories/notification', () => ({
  NotificationRepo: {
    create: mockCreate,
    find: mockFind,
    findOne: mockFindOne,
    update: mockUpdate,
    updateMany: mockUpdateMany,
    count: mockCount
  }
}))

import NotificationDataAgent from './NotificationDataAgent'
import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'

describe('NotificationDataAgent', () => {
  let notificationDataAgent
  beforeEach(() => {
    notificationDataAgent = new NotificationDataAgent()
    mockCreate.mockClear()
    mockFind.mockClear()
    mockFindOne.mockClear()
  })

  it('should create notification', async () => {
    const result = await notificationDataAgent.createNotification(mockNotification)
    expect(result).toEqual(mockNotification)
  })

  it('should throw error', async () => {
    expect.assertions(2)
    mockCreate.mockImplementation(() => ({ errors: 'error' }))
    try {
      await notificationDataAgent.createNotification(mockNotification)
    } catch (e) {
      expect(e.status).toEqual(422)
      expect(e).toEqual(
        ErrorUtils.unprocessableEntityException(
          ErrorCode.ValidationHttpContent,
          'Database could not process the request.'
        )
      )
    }
  })

  it('should return notifications', async () => {
    const result = await notificationDataAgent.getNotifications('someUserId', 5, 10)
    expect(result).toEqual(mockNotifications)
    expect(mockNotifications.skip).toHaveBeenCalledWith(5)
    expect(mockNotifications.limit).toHaveBeenCalledWith(10)
  })

  it('should return notifications', async () => {
    const result = await notificationDataAgent.getNotifications('someUserId')
    expect(result).toEqual(mockNotifications)
  })

  it('should return notification count', async () => {
    const result = await notificationDataAgent.getNotificationsCount()
    expect(result).toEqual(1)
  })

  it('should return notification count', async () => {
    const result = await notificationDataAgent.getNotificationsCount(1, 1)
    expect(result).toEqual(1)
  })

  it('should return notification by id', async () => {
    const result = await notificationDataAgent.getNotificationById('test')
    expect(result).toEqual(mockNotification)
  })

  it('should throw error on get notification by id', async () => {
    expect.assertions(2)
    mockFindOne.mockImplementation(() => ({ exec: jest.fn().mockResolvedValueOnce(null) }))
    try {
      await notificationDataAgent.getNotificationById('test')
    } catch (e) {
      expect(e.status).toEqual(404)
      expect(e).toEqual(ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Notification not found'))
    }
  })

  it('should update notification isRead', async () => {
    await notificationDataAgent.updateNotificationIsRead('test', { isRead: true })
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('should call updateMany', async () => {
    await notificationDataAgent.findAndUpdateNotificationsIsRead('test', { isRead: true })
    expect(mockUpdateMany).toHaveBeenCalled()
  })
})
