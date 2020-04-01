import 'reflect-metadata'
import { EmailService } from './EmailService'
import { IUser } from '@komgo/types'
import { ITask, TaskStatus, TaskType } from '../../service-layer/request/task'
import { buildEmailTemplate, EmailType } from './templates/template'
import { INotification } from '../../service-layer/responses/notification'
import { NotificationLevel } from '../../service-layer/request/notification'

const rabbitChannelInternalMock: any = {
  publish: jest.fn()
}

const emailData = {
  subject: 'test subject',
  taskLink: 'link',
  taskTitle: 'title'
}

const testUser: IUser = {
  id: 'test',
  firstName: 'test',
  lastName: 'test',
  username: 'test',
  createdAt: 0,
  email: 'test@example.com'
}

const testTask: ITask = {
  _id: 'task-1',
  summary: 'task summary',
  taskType: TaskType.ReviewIssued,
  status: TaskStatus.ToDo,
  counterpartyStaticId: 'static-id-1',
  assignee: 'assignee',
  requiredPermission: { productId: 'product-1', actionId: 'action-1' },
  context: { type: 'LC' },
  updatedAt: new Date('2019-01-01'),
  createdAt: new Date('2019-01-01'),
  dueAt: new Date('2019-01-01')
}

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

const emailService = new EmailService(rabbitChannelInternalMock, true)

describe('EmailService', () => {
  it('sendEmail successfully - task', async () => {
    emailService.isEmailEnabled = jest.fn(() => Promise.resolve(true))

    await emailService.sendTaskEmail([testUser], emailData, testTask)

    expect(rabbitChannelInternalMock.publish).toHaveBeenCalledWith(
      'komgo.email-notification',
      {
        body: buildEmailTemplate({ link: 'link/task-1', linkTitle: 'title', type: EmailType.Task }),
        recipients: ['test@example.com'],
        subject: 'test subject'
      },
      { recipientPlatform: 'email-notification' }
    )
  })

  it('sendEmail successfully - notification', async () => {
    emailService.isEmailEnabled = jest.fn(() => Promise.resolve(true))

    await emailService.sendNotificationEmail([testUser], emailData, testNotif)

    expect(rabbitChannelInternalMock.publish).toHaveBeenCalledWith(
      'komgo.email-notification',
      {
        body: buildEmailTemplate({ link: 'link/notif-id', linkTitle: 'title', type: EmailType.Notification }),
        recipients: ['test@example.com'],
        subject: 'test subject'
      },
      { recipientPlatform: 'email-notification' }
    )
  })
})
