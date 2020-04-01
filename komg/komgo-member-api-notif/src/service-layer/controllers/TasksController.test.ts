import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'
import { IUser } from '@komgo/types'
import { mock, sleep } from '../../utils/test-utils'
import TaskDataAgent from '../../data-layer/data-agents/TaskDataAgent'
import NotificationDataAgent from '../../data-layer/data-agents/NotificationDataAgent'
import { ITask, TaskStatus, ITaskWithMessageCreateRequest, ITaskCreateRequest, TaskType } from '../request/task'
import { ErrorName } from '../utils/ErrorName'

const getPermissionsByToken = jest.fn(() => [{ productId: 'product-1', actionId: 'action-1' }])
jest.mock('../../data-layer/utils/getPermissionsByToken', () => ({
  getPermissionsByToken
}))

jest.mock('../../data-layer/utils/decodeBearerToken', () => ({
  decodeBearerToken: () => ({ name: 'test' })
}))

jest.mock('@komgo/logging', () => {
  const loggerMock = { error: jest.fn(), info: jest.fn() }
  return { getLogger: () => loggerMock }
})

const testUser: IUser = {
  id: 'test',
  firstName: 'test',
  lastName: 'test',
  username: 'test',
  createdAt: 0,
  email: 'test'
}

const getUserById: any = jest.fn(async () => ({ data: testUser }))
jest.mock('../../data-layer/utils/getUserById', () => ({
  getUserById
}))

let getUserSettingsById: any = jest.fn(async () => ({ data: { sendTaskNotificationsByEmail: true } }))
jest.mock('../../data-layer/utils/getUserSettingsById', () => ({
  getUserSettingsById
}))

const notifControllerMock = jest.fn()
jest.mock('./NotificationsController', () => ({
  NotificationsController: notifControllerMock
}))

const getUserIDsByPermissionMock = jest.fn(async () => ['test', 'test1'])
jest.mock('../../data-layer/utils/getUsersByPermission', () => ({
  getUsersByPermission: jest.fn(async () => [
    { id: 'test', email: 'test@example.com' },
    { id: 'test1', email: 'test1@example.com' }
  ]),
  getUserIDsByPermission: getUserIDsByPermissionMock
}))
const rabbitChannelMock: any = {
  publish: jest.fn()
}

const rabbitChannelInternalMock: any = {
  publish: jest.fn()
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

const taskWithEmail: ITaskCreateRequest = {
  summary: 'task summary',
  taskType: TaskType.ReviewIssued,
  emailData: {
    subject: 'test subject',
    taskLink: 'link',
    taskTitle: 'title'
  },
  status: TaskStatus.ToDo,
  counterpartyStaticId: 'static-id-1',
  requiredPermission: { productId: 'product-1', actionId: 'action-1' },
  context: { type: 'LC' },
  dueAt: new Date('2019-01-01')
}

const taskRequest: ITaskWithMessageCreateRequest = {
  message: 'message',
  task: testTask
}

const taskRequestWithEmail: ITaskWithMessageCreateRequest = {
  message: 'message',
  task: taskWithEmail
}

import { TasksController } from './TasksController'
import { IEmailService, EmailService } from '../../business-layer/emails/EmailService'
import { buildEmailTemplate, EmailType } from '../../business-layer/emails/templates/template'

describe('TaskController', () => {
  let taskDataAgent: any
  let notificationDataAgent: any
  let taskController: any
  let emailService: IEmailService

  beforeEach(() => {
    jest.clearAllMocks()

    taskDataAgent = mock(TaskDataAgent)
    notificationDataAgent = mock(NotificationDataAgent)
    emailService = new EmailService(rabbitChannelInternalMock, true)

    taskController = new TasksController(taskDataAgent, notificationDataAgent, rabbitChannelMock, emailService)

    taskDataAgent.createTask.mockReturnValue(testTask)
    taskDataAgent.getTasks.mockReturnValue([testTask])
    taskDataAgent.getTask.mockReturnValue(testTask)
    taskDataAgent.updateTaskAssignee.mockReturnValue(testTask)
    taskDataAgent.updateTaskStatus.mockReturnValue(testTask)
  })

  it('should create task and return it', async () => {
    const result = await taskController.CreateNewTask(taskRequest)
    expect(result).toEqual(testTask)
  })

  it('should create a task and send email notification', async () => {
    emailService.isEmailEnabled = jest.fn(() => Promise.resolve(true))

    await taskController.CreateNewTask(taskRequestWithEmail)
    expect(rabbitChannelInternalMock.publish).toHaveBeenCalledWith(
      'komgo.email-notification',
      {
        body: buildEmailTemplate({ link: 'link/task-1', linkTitle: 'title', type: EmailType.Task }),
        recipients: ['test1@example.com'],
        subject: 'test subject'
      },
      { recipientPlatform: 'email-notification' }
    )
  })

  it('should create a task and without send email notification if api-users return 404', async () => {
    getUserSettingsById.mockResolvedValueOnce({ sendTaskNotificationsByEmail: false })

    await taskController.CreateNewTask(taskRequestWithEmail)
    expect(rabbitChannelInternalMock.publish).not.toBeCalled()
  })

  it('should create a task and without send email notification', async () => {
    emailService.isEmailEnabled = jest.fn(() => Promise.resolve(false))

    const result = await taskController.CreateNewTask(taskRequestWithEmail)
    expect(result.status).toBe('To Do')
  })

  it('should return tasks with user', async () => {
    const result = await taskController.GetTasks('token')

    expect(result).toEqual([{ user: testUser, task: testTask }])
  })

  it('should call getTasks with status', async () => {
    await taskController.GetTasks('token', TaskStatus.Pending)

    expect(taskDataAgent.getTasks).toHaveBeenCalledWith({
      requiredPermission: { $in: [{ actionId: 'action-1', productId: 'product-1' }] },
      status: TaskStatus.Pending
    })
  })

  it('should call getTasks with context.type', async () => {
    await taskController.GetTasksInternal(TaskStatus.ToDo, null, '{"type":"counterpartyCoverageRequest"}')

    expect(taskDataAgent.getTasks).toHaveBeenCalledWith({
      'context.type': 'counterpartyCoverageRequest',
      status: TaskStatus.ToDo
    })
  })

  it('should return tasks with status, context and taskType', async () => {
    await taskController.GetTasksInternal(
      TaskStatus.ToDo,
      'Counterparty.task',
      '{"type":"counterpartyCoverageRequest"}'
    )

    expect(taskDataAgent.getTasks).toHaveBeenCalledWith({
      'context.type': 'counterpartyCoverageRequest',
      status: 'To Do',
      taskType: 'Counterparty.task'
    })
  })

  it('should return tasks without user', async () => {
    const taskWithoutAssignee = { ...testTask, assignee: null }
    taskDataAgent.getTasks.mockReturnValueOnce([taskWithoutAssignee])

    const result = await taskController.GetTasks()

    expect(result).toEqual([{ task: taskWithoutAssignee, user: null }])
  })

  it('should return task without user', async () => {
    const taskWithoutAssignee = { ...testTask, assignee: null }
    taskDataAgent.getTask.mockReturnValueOnce(taskWithoutAssignee)

    const result = await taskController.GetTask(1, 'test')

    expect(result).toEqual({ task: taskWithoutAssignee, user: null })
  })

  it('should return task with user', async () => {
    const result = await taskController.GetTask(1, 'test')

    expect(result).toEqual({ user: testUser, task: testTask })
  })

  it('should throw error on getting task', async () => {
    getPermissionsByToken.mockReturnValueOnce([{ productId: 'test', actionId: 'fail' }])

    await expect(taskController.GetTask(1, 'test')).rejects.toEqual(
      ErrorUtils.forbiddenException(ErrorCode.ValidationHttpContent, "You don't have permissions to view this task")
    )
  })

  it('should throw error 403 on updating assignee in task', async () => {
    getPermissionsByToken.mockReturnValueOnce([{ productId: 'test', actionId: 'fail' }])

    await expect(taskController.UpdateTaskAssignee(undefined, 'test', { assignee: 'test' })).rejects.toEqual(
      ErrorUtils.forbiddenException(ErrorCode.ValidationHttpContent, "You don't have permissions to update this task")
    )
  })

  it('should throw error 422 on updating assignee in task', async () => {
    getUserById.mockRejectedValueOnce({ response: { status: 404 } })

    await expect(taskController.UpdateTaskAssignee('test', 'test', { assignee: 'test' })).rejects.toEqual(
      ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'assignee should contain valid userId value'
      )
    )
  })

  it('should throw error 500 on updating assignee in task', async () => {
    getUserById.mockRejectedValueOnce({ response: { status: 500 } })

    await expect(taskController.UpdateTaskAssignee('test', 'test', { assignee: 'test' })).rejects.toEqual({
      response: { status: 500 }
    })
  })

  it('should throw error 403 on updating assignee in task', async () => {
    getUserIDsByPermissionMock.mockResolvedValueOnce([])

    await expect(taskController.UpdateTaskAssignee(undefined, 'test2', { assignee: 'test2' })).rejects.toEqual(
      ErrorUtils.forbiddenException(ErrorCode.ValidationHttpContent, 'This user can not be assigned to this task')
    )
  })

  it('should update task assignee and return task', async () => {
    const result = await taskController.UpdateTaskAssignee('test', 'test2', { assignee: 'test' })
    expect(result).toEqual({ task: testTask, user: testUser })
  })

  it('should update task assignee to unassigned and return task', async () => {
    const taskWithoutAssignee = { ...testTask, assignee: null }
    taskDataAgent.getTask.mockReturnValueOnce(taskWithoutAssignee)
    taskDataAgent.updateTaskAssignee.mockReturnValueOnce(taskWithoutAssignee)

    const result = await taskController.UpdateTaskAssignee('test', 'test', {})

    expect(result).toEqual({ task: taskWithoutAssignee, user: undefined })
  })

  it('should update task status and return task', async () => {
    const result = await taskController.UpdateTaskStatus()

    expect(result).toEqual(testTask)
  })

  it('should publish task to WS queue on task creation', async () => {
    await taskController.CreateNewTask(taskRequest)

    expect(rabbitChannelMock.publish).toHaveBeenCalledWith(
      'INTERNAL.WS.action',
      {
        payload: {
          task: {
            _id: 'task-1',
            assignee: 'assignee',
            context: { type: 'LC' },
            counterpartyStaticId: 'static-id-1',
            createdAt: new Date('2019-01-01T00:00:00.000Z'),
            dueAt: new Date('2019-01-01T00:00:00.000Z'),
            requiredPermission: { actionId: 'action-1', productId: 'product-1' },
            status: 'To Do',
            summary: 'task summary',
            taskType: TaskType.ReviewIssued,
            updatedAt: new Date('2019-01-01T00:00:00.000Z')
          },
          user: {
            id: 'test',
            email: 'test',
            firstName: 'test',
            lastName: 'test',
            createdAt: 0,
            username: 'test'
          }
        },
        recipient: 'test',
        type: '@@tasks/NEW_TASK',
        version: '1'
      },

      expect.any(Object)
    )
  })

  it('logs error if publish fails', async () => {
    const getLogger = (await require('@komgo/logging')).getLogger
    const logError = getLogger().error
    rabbitChannelMock.publish.mockRejectedValue(new Error('Oops!'))

    await taskController.CreateNewTask(taskRequest)
    await sleep(1)

    expect(logError).toHaveBeenCalledWith(
      ErrorCode.ConnectionInternalMQ,
      ErrorName.publishMessageFailed,
      'Oops!',
      expect.any(Object)
    )
  })
})
