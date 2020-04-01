import 'reflect-metadata'

const mockTask = {
  status: 'test',
  taskType: 'test',
  context: {
    key: 'value'
  }
}

const mockFind: any = jest.fn(() => [mockTask])
const mockFindOne: any = jest.fn(() => mockTask)
const mockFindOneAndUpdate: any = jest.fn(() => mockTask)
const mockCreate: any = jest.fn(data => ({ status: data.status }))
jest.mock('../data-abstracts/repositories/task', () => ({
  TaskRepository: {
    findOne: jest.fn(() => ({ exec: mockFindOne })),
    findOneAndUpdate: jest.fn(() => ({ exec: mockFindOneAndUpdate })),
    find: mockFind,
    create: mockCreate
  }
}))

import TaskDataAgent from './TaskDataAgent'
import { flattenFieldQuery } from '../../service-layer/utils/queryStringUtils'
import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'

describe('TaskDataAgent', () => {
  let taskDataAgent
  beforeEach(() => {
    mockCreate.mockClear()
    mockFind.mockClear()
    mockFindOne.mockClear()
    mockFindOneAndUpdate.mockClear()
    taskDataAgent = new TaskDataAgent()
  })

  it('should create task with status To Do by default', async () => {
    mockFindOne.mockImplementation(() => null)
    const result = await taskDataAgent.createTask({})
    expect(result.status).toEqual('To Do')
  })

  it('should create task with defined status', async () => {
    mockFindOne.mockImplementation(() => null)
    const result = await taskDataAgent.createTask(mockTask)
    expect(result.status).toEqual('test')
  })

  it('should throw an error if task with context does not  exist', async () => {
    expect.assertions(2)
    mockFindOne.mockResolvedValue(mockTask)
    try {
      await taskDataAgent.createTask(mockTask)
    } catch (e) {
      expect(e.status).toEqual(409)
      expect(e).toEqual(
        ErrorUtils.conflictException(
          ErrorCode.ValidationHttpContent,
          `Task with context ${JSON.stringify(mockTask.context)} already exists`
        )
      )
    }
  })

  it('should throw an error if task with context does not  exist', async () => {
    expect.assertions(2)
    mockFindOne.mockResolvedValue(null)
    try {
      await taskDataAgent.getTask('test')
    } catch (e) {
      expect(e.status).toEqual(404)
      expect(e).toEqual(ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Task not found'))
    }
  })

  it('should return task', async () => {
    mockFindOne.mockImplementation(() => mockTask)
    const result = await taskDataAgent.getTask('test')
    expect(result).toEqual(mockTask)
  })

  it('should return tasks', async () => {
    const result = await taskDataAgent.getTasks({})
    expect(result).toEqual([mockTask])
  })

  it('should return tasks with params', async () => {
    mockFind.mockImplementationOnce(() => [mockTask])
    const query = {
      status: 'ToDo',
      taskType: 'Counterparty.task',
      context: flattenFieldQuery(JSON.parse('{"type":"counterpartyCoverageRequest"}'), 'context')
    }
    const result = await taskDataAgent.getTasks(query)
    expect(result).toEqual([mockTask])
  })

  it('should update task assignee', async () => {
    mockFindOne.mockImplementation(() => ({
      set: () => null,
      save: () => mockTask,
      validate: callback => callback(false)
    }))
    const result = await taskDataAgent.updateTaskAssignee('test', { assignee: 'test' })
    expect(result).toEqual(mockTask)
  })

  it('should throw error', async () => {
    mockFindOne.mockImplementation(() => null)
    expect.assertions(2)
    try {
      await taskDataAgent.updateTaskAssignee('test', { assignee: 'test' })
    } catch (e) {
      expect(e.status).toEqual(404)
      expect(e).toEqual(ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Task not found'))
    }
  })

  it('should throw error', async () => {
    mockFindOne.mockImplementation(() => ({ status: 'Done', taskType: 'test' }))
    expect.assertions(2)
    try {
      await taskDataAgent.updateTaskAssignee('test', { assignee: 'test' })
    } catch (e) {
      expect(e.status).toEqual(422)
      expect(e).toEqual(
        ErrorUtils.unprocessableEntityException(
          ErrorCode.ValidationHttpContent,
          'Can\'t update assignee in task with status "Done"'
        )
      )
    }
  })

  it('should update task status', async () => {
    mockFindOne.mockImplementation(() => mockTask)
    const result = await taskDataAgent.updateTaskStatus({ status: 'test', context: 'test', taskType: 'test' })
    expect(result).toEqual(mockTask)
  })

  it('should update task status', async () => {
    mockFindOne.mockImplementation(() => mockTask)
    const result = await taskDataAgent.updateTaskStatus({ status: 'test', context: 'test', taskType: 'test' })
    expect(result).toEqual(mockTask)
  })

  it("should throw error because 'outcome' field not defined", async () => {
    mockFindOne.mockImplementation(() => null)
    expect.assertions(2)
    try {
      await taskDataAgent.updateTaskStatus({ status: 'Done', context: 'test', taskType: 'test' })
    } catch (e) {
      expect(e.status).toEqual(422)
      expect(e).toEqual(
        ErrorUtils.unprocessableEntityException(ErrorCode.ValidationHttpContent, "'outcome' field should be defined")
      )
    }
  })

  it('should throw error because task not found', async () => {
    mockFindOne.mockImplementation(() => null)
    expect.assertions(2)
    try {
      await taskDataAgent.updateTaskStatus({
        status: 'test',
        context: 'test',
        outcome: true,
        taskType: 'test'
      })
    } catch (e) {
      expect(e.status).toEqual(404)
      expect(e).toEqual(ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Task not found'))
    }
  })

  it("should throw error because task status can't be updated if status already Done", async () => {
    mockFindOne.mockImplementation(() => ({ status: 'Done', taskType: 'test' }))
    expect.assertions(2)
    try {
      await taskDataAgent.updateTaskStatus({ status: 'test', context: 'test', outcome: true })
    } catch (e) {
      expect(e.status).toEqual(422)
      expect(e).toEqual(
        ErrorUtils.unprocessableEntityException(
          ErrorCode.ValidationHttpContent,
          'Can\'t update status in task with status "Done"'
        )
      )
    }
  })

  it('should throw error because task not found while performing findAndModify', async () => {
    mockFindOne.mockImplementation(() => mockTask)
    mockFindOneAndUpdate.mockImplementation(() => null)
    expect.assertions(2)
    try {
      await taskDataAgent.updateTaskStatus({
        status: 'test',
        context: 'test',
        outcome: true,
        taskType: 'test'
      })
    } catch (e) {
      expect(e.status).toEqual(404)
      expect(e).toEqual(ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Task not found'))
    }
  })
})
