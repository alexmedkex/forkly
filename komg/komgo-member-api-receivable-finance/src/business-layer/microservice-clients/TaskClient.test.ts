import { ITaskCreateRequest, TaskManager, TaskStatus } from '@komgo/notification-publisher'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { PRODUCT_ID } from '../../constants'
import { TaskError } from '../errors'
import { TaskType } from '../types'

import { TaskClient } from './TaskClient'

const task: ITaskCreateRequest = {
  summary: 'summary',
  taskType: TaskType.RequestTaskType,
  status: TaskStatus.ToDo,
  counterpartyStaticId: 'counterparty-name',
  requiredPermission: {
    productId: 'tradeFinance',
    actionId: 'manageRD'
  },
  context: {
    key: 'value'
  }
}

const updateTaskStatusRequest = {
  status: TaskStatus.Done,
  context: {
    key: 'value'
  },
  taskType: TaskType.RequestTaskType,
  outcome: true,
  assignee: 'userId'
}

const taskManager = createMockInstance(TaskManager)

describe('TaskClient', () => {
  let taskClient: TaskClient

  beforeEach(function() {
    taskClient = new TaskClient(taskManager, 0)
  })

  describe('sendTask', () => {
    it('creates a task', async () => {
      await taskClient.sendTask(task, 'message')

      expect(taskManager.createTask).toBeCalledWith(task, 'message')
    })

    it('processes a task creation error', async () => {
      taskManager.createTask.mockRejectedValueOnce(httpError('Error message', 400))

      const call = taskClient.sendTask(task, 'message')

      await expect(call).rejects.toEqual(new TaskError('Failed to create a task. Error message'))
    })

    it('does not throw an exception when attempts to create a duplicated task', async () => {
      taskManager.createTask.mockRejectedValueOnce(httpError('Duplicated task', 409))

      await taskClient.sendTask(task, 'message')

      expect(taskManager.createTask).toBeCalledWith(task, 'message')
    })
  })

  describe('completeTask', () => {
    it('update a task status', async () => {
      await taskClient.completeTask(
        updateTaskStatusRequest.taskType,
        updateTaskStatusRequest.assignee,
        updateTaskStatusRequest.context
      )

      expect(taskManager.updateTaskStatus).toBeCalledWith(updateTaskStatusRequest)
    })

    it('does not throw an exception when attempts to resolve task that does not exists', async () => {
      taskManager.updateTaskStatus.mockRejectedValueOnce(httpError('Not found task', 404))

      await taskClient.completeTask(
        updateTaskStatusRequest.taskType,
        updateTaskStatusRequest.assignee,
        updateTaskStatusRequest.context
      )

      expect(taskManager.updateTaskStatus).toBeCalledWith(updateTaskStatusRequest)
    })

    it('processes a update task status error', async () => {
      taskManager.updateTaskStatus.mockRejectedValueOnce(httpError('Error message', 400))

      const promise = taskClient.completeTask(
        updateTaskStatusRequest.taskType,
        updateTaskStatusRequest.assignee,
        updateTaskStatusRequest.context
      )

      await expect(promise).rejects.toEqual(new TaskError('Failed to update task status. Error message'))
    })

    it('throws an exception when attempts to create a duplicated task', async () => {
      taskManager.updateTaskStatus.mockRejectedValueOnce(httpError('Duplicated task', 409))

      const promise = taskClient.completeTask(
        updateTaskStatusRequest.taskType,
        updateTaskStatusRequest.assignee,
        updateTaskStatusRequest.context
      )

      await expect(promise).rejects.toEqual(new TaskError('Failed to update task status. Duplicated task'))
    })
  })

  describe('createTaskRequest', () => {
    it('should return a notification object successfully', async () => {
      const senderStaticId = 'senderStaticId'
      const actionId = 'actionId'
      const summary = 'summary'
      const mockContext = {
        productId: 'test'
      }
      const expectedTask = {
        summary,
        taskType: TaskType.RequestTaskType,
        status: TaskStatus.ToDo,
        counterpartyStaticId: senderStaticId,
        requiredPermission: {
          productId: PRODUCT_ID,
          actionId
        },
        context: { ...mockContext, senderStaticId }
      }

      const notification = await taskClient.createTaskRequest(
        TaskType.RequestTaskType,
        summary,
        senderStaticId,
        actionId,
        mockContext
      )
      expect(notification).toEqual(expectedTask)
    })
  })
})

function httpError(msg: string, statusCode: number) {
  const error: any = new Error(msg)
  error.response = {
    status: statusCode
  }

  return error
}
