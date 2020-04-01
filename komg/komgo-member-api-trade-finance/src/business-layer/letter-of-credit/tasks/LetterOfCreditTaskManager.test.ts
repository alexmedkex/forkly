import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import { ILetterOfCredit, LetterOfCreditTaskType, buildFakeLetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { TaskManager, ITaskCreateRequest, TaskStatus, ITask } from '@komgo/notification-publisher'
import { getLogger, LogstashCapableLogger } from '@komgo/logging'

import { TRADE_FINANCE_ACTION, TRADE_FINANCE_PRODUCT_ID } from '../../tasks/permissions'

import { ILetterOfCreditTaskManager } from './ILetterOfCreditTaskManager'
import { LetterOfCreditTaskManager } from './LetterOfCreditTaskManager'

const buildFakeTask = (): ITask => {
  return {
    _id: 'id',
    summary: 'summary',
    taskType: LetterOfCreditTaskType.ReviewRequested,
    status: TaskStatus.ToDo,
    assignee: 'assignee',
    requiredPermission: {
      productId: TRADE_FINANCE_PRODUCT_ID,
      actionId: TRADE_FINANCE_ACTION.ReviewLC
    },
    context: {
      type: 'ILetterOfCredit',
      staticId: 'staticId'
    },
    updatedAt: new Date(),
    createdAt: new Date()
  }
}

const mockLogger = {
  info: jest.fn()
}

jest.mock('@komgo/logging', () => ({
  getLogger: jest.fn(() => mockLogger)
}))

describe('LetterOfCreditTaskManager tests', () => {
  let letterOfCreditTaskManager: ILetterOfCreditTaskManager
  let mockTaskManager: jest.Mocked<TaskManager>
  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>

  beforeEach(() => {
    mockTaskManager = createMockInstance(TaskManager)
    letterOfCredit = buildFakeLetterOfCredit()
    letterOfCreditTaskManager = new LetterOfCreditTaskManager(mockTaskManager)
  })

  describe('createTask', () => {
    const text = 'Message'
    const letterOfCreditTaskType = LetterOfCreditTaskType.ReviewRequested
    const tradeFinanceAction = TRADE_FINANCE_ACTION.ReviewLC
    let expectedContext: any

    beforeEach(() => {
      expectedContext = {
        type: 'ILetterOfCredit',
        staticId: letterOfCredit.staticId
      }
    })

    it('should create a letter of credit task', async () => {
      const taskRequest: ITaskCreateRequest = {
        summary: text,
        requiredPermission: {
          productId: TRADE_FINANCE_PRODUCT_ID,
          actionId: tradeFinanceAction
        },
        status: TaskStatus.ToDo,
        context: expectedContext,
        taskType: letterOfCreditTaskType
      }

      await letterOfCreditTaskManager.createTask(letterOfCredit, text, letterOfCreditTaskType, tradeFinanceAction)

      expect(mockTaskManager.createTask).toHaveBeenCalled()
      expect(mockTaskManager.createTask).toHaveBeenCalledTimes(1)
      expect(mockTaskManager.createTask).toHaveBeenCalledWith(taskRequest, text)
    })

    it('should create a letter of credit task with email options', async () => {
      const subject = 'subject'
      const emailTaskLink = 'link'
      const emailTaskTitle = 'title'

      const taskRequest: ITaskCreateRequest = {
        summary: text,
        requiredPermission: {
          productId: TRADE_FINANCE_PRODUCT_ID,
          actionId: tradeFinanceAction
        },
        status: TaskStatus.ToDo,
        context: expectedContext,
        taskType: letterOfCreditTaskType,
        emailData: {
          subject,
          taskLink: emailTaskLink,
          taskTitle: emailTaskTitle
        }
      }

      await letterOfCreditTaskManager.createTask(letterOfCredit, text, letterOfCreditTaskType, tradeFinanceAction, {
        subject,
        emailTaskLink,
        emailTaskTitle
      })

      expect(mockTaskManager.createTask).toHaveBeenCalled()
      expect(mockTaskManager.createTask).toHaveBeenCalledTimes(1)
      expect(mockTaskManager.createTask).toHaveBeenCalledWith(taskRequest, text)
    })
  })

  describe('resolveTask', () => {
    let mockTasks: ITask[]
    beforeEach(() => {
      const context = {
        type: 'ILetterOfCredit',
        staticId: letterOfCredit.staticId
      }
      mockTasks = [{ ...buildFakeTask(), context }]
    })
    it('should resolve a letter of credit task', async () => {
      const outcome = true

      mockTaskManager.getTasks.mockImplementation(() => Promise.resolve(mockTasks))

      await letterOfCreditTaskManager.resolveTask(letterOfCredit, LetterOfCreditTaskType.ReviewRequested, outcome)

      expect(mockTaskManager.updateTaskStatus).toHaveBeenCalled()
      expect(mockTaskManager.updateTaskStatus).toHaveBeenCalledTimes(1)
      expect(mockTaskManager.updateTaskStatus).toHaveBeenCalledWith({
        status: TaskStatus.Done,
        taskType: mockTasks[0].taskType,
        context: mockTasks[0].context,
        outcome
      })
    })

    it('should return when no tasks are found', async () => {
      const outcome = true

      mockTaskManager.getTasks.mockImplementation(() => Promise.resolve([]))

      await letterOfCreditTaskManager.resolveTask(letterOfCredit, LetterOfCreditTaskType.ReviewRequested, outcome)

      expect(mockTaskManager.updateTaskStatus).toHaveBeenCalledTimes(0)
      expect(mockLogger.info).toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledTimes(2)
      expect(mockLogger.info).toHaveBeenCalledWith('No task found for resolving', {
        letterOfCredit,
        taskType: mockTasks[0].taskType,
        context: mockTasks[0].context
      })
    })
  })
})
