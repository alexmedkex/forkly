import 'reflect-metadata'

import { ITaskCreateRequest, ITaskUpdateStatusRequest, TaskManager, TaskStatus } from '@komgo/notification-publisher'
import * as AxiosError from 'axios-error'

import { mock } from '../../mock-utils'
import { NOTIFICATION_TYPE } from '../messaging/enums'

import { TaskClient } from './TaskClient'
import TaskError from './TaskError'

const task: ITaskCreateRequest = {
  summary: 'summary',
  taskType: NOTIFICATION_TYPE.DocumentInfo,
  status: TaskStatus.ToDo,
  counterpartyName: 'counterparty-name',
  context: {
    key: 'value'
  }
}

const updateTaskStatusRequest: ITaskUpdateStatusRequest = {
  status: TaskStatus.ToDo,
  context: {
    key: 'value'
  }
}

const taskManager = mock(TaskManager)

describe('TaskClient', () => {
  let taskClient: TaskClient

  beforeEach(function() {
    jest.resetAllMocks()

    taskClient = new TaskClient(taskManager, 0)
  })

  it('creates a task', async () => {
    await taskClient.createTask(task, 'message')

    expect(taskManager.createTask).toBeCalledWith(task, 'message')
  })

  it('processes a task creation error', async () => {
    taskManager.createTask.mockRejectedValue(httpError('Error message', 400))

    const call = taskClient.createTask(task, 'message')

    await expect(call).rejects.toEqual(new TaskError('Failed to create a task. Error message'))
  })

  it('processes a task creation error for permissions', async () => {
    taskManager.createTask.mockRejectedValue(httpError('Request format error', 422))

    const call = taskClient.createTask(task, 'message')

    expect(taskManager.createTask).toBeCalledWith(task, 'message')
  })

  it('does not throw an exception when attempts to create a duplicated task', async () => {
    taskManager.createTask.mockRejectedValue(httpError('Duplicated task', 409))

    await taskClient.createTask(task, 'message')

    expect(taskManager.createTask).toBeCalledWith(task, 'message')
  })

  it('update a task status', async () => {
    await taskClient.updateTaskStatus(updateTaskStatusRequest)

    expect(taskManager.updateTaskStatus).toBeCalledWith(updateTaskStatusRequest)
  })

  it('does not throw an exception when attempts to resolve task that does not exists', async () => {
    taskManager.updateTaskStatus.mockRejectedValue(httpError('Not found task', 404))

    await taskClient.updateTaskStatus(updateTaskStatusRequest)

    expect(taskManager.updateTaskStatus).toBeCalledWith(updateTaskStatusRequest)
  })

  it('processes a update task status error', async () => {
    taskManager.updateTaskStatus.mockRejectedValue(httpError('Error message', 400))

    const call = taskClient.updateTaskStatus(updateTaskStatusRequest)

    await expect(call).rejects.toEqual(new TaskError('Failed to update a task status. Error message'))
  })

  it('throws an exception when attempts to create a duplicated task', async () => {
    taskManager.updateTaskStatus.mockRejectedValue(httpError('Duplicated task', 409))

    const call = taskClient.updateTaskStatus(updateTaskStatusRequest)

    await expect(call).rejects.toEqual(new TaskError('Failed to update a task status. Duplicated task'))
  })
})

function httpError(msg: string, statusCode: number) {
  const error: any = new Error(msg)

  error.response = {
    status: statusCode
  }

  return error
}
