import { TaskManager, ITaskCreateRequest } from '@komgo/notification-publisher'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { TIMER_JOB_TYPE } from '../TimerJobType'

import { TaskJobProcessor } from './TaskJobProcessor'

let taskJobProcessor: TaskJobProcessor
let taskManagerClient: TaskManager
const mockTask: ITaskCreateRequest = {
  summary: 'summary',
  taskType: 'TIMER.TASK',
  context: {
    key: 'value'
  },
  requiredPermission: {
    productId: 'productId',
    actionId: 'actionId'
  }
}

describe('NotificationJobProcessor', () => {
  beforeEach(() => {
    taskManagerClient = createMockInstance(TaskManager)
    taskJobProcessor = new TaskJobProcessor(taskManagerClient)
  })

  it('create task', async () => {
    expect(
      await taskJobProcessor.executeJob({
        jobType: TIMER_JOB_TYPE.CreateTask,
        message: 'Test message',
        task: mockTask
      })
    ).toBeTruthy()
    expect(taskManagerClient.createTask).toBeCalledWith(mockTask, 'Test message')
  })

  it('missing notification', async () => {
    expect(
      await taskJobProcessor.executeJob({ jobType: TIMER_JOB_TYPE.CreateTask, task: null, message: null })
    ).toBeFalsy()
    expect(taskManagerClient.createTask).not.toBeCalled()
  })

  it('failed notification', async () => {
    taskManagerClient.createTask = jest.fn().mockImplementation(() => {
      throw new Error('Task create error')
    })
    await expect(
      taskJobProcessor.executeJob({
        jobType: TIMER_JOB_TYPE.CreateTask,
        message: 'Test message',
        task: mockTask
      })
    ).rejects.toEqual(new Error('Task create error'))
  })
})
