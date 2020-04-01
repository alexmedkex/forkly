import { injectable } from 'inversify'

import { TaskRepository } from '../data-abstracts/repositories/task'
import { toDotNotation } from '../utils/toDotNotation'
import {
  ITask,
  ITaskCreateRequest,
  ITaskUpdateAssigneeRequest,
  ITaskUpdateStatusRequest,
  TaskStatus
} from '../../service-layer/request/task'
import { ITaskDataAgent } from './interfaces/ITaskDataAgent'
import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'

const TASK_NOT_FOUND_ERROR = 'Task not found'

@injectable()
export default class TaskDataAgent implements ITaskDataAgent {
  async createTask(data: ITaskCreateRequest): Promise<ITask> {
    const alreadyCreated = await TaskRepository.findOne({ context: data.context, taskType: data.taskType }).exec()
    if (alreadyCreated) {
      throw ErrorUtils.conflictException(
        ErrorCode.ValidationHttpContent,
        `Task with context ${JSON.stringify(data.context)} already exists`
      )
    }
    const dataWithStatus = data.status ? data : { ...data, status: TaskStatus.ToDo }
    delete dataWithStatus.outcome
    return TaskRepository.create({ ...dataWithStatus, assignee: null })
  }

  async getTask(id: string): Promise<ITask> {
    const result = await TaskRepository.findOne({ _id: id }).exec()
    if (!result) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, TASK_NOT_FOUND_ERROR)
    }
    return result
  }

  async getTasks(query: object): Promise<ITask[]> {
    return TaskRepository.find(query, null, { sort: { createdAt: -1 } })
  }

  async updateTaskAssignee(id: string, { assignee }: ITaskUpdateAssigneeRequest): Promise<ITask> {
    const result = await TaskRepository.findOne({ _id: id }).exec()
    if (!result) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, TASK_NOT_FOUND_ERROR)
    }

    if (result.status === TaskStatus.Done) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'Can\'t update assignee in task with status "Done"'
      )
    }

    result.set({ assignee })
    return result.save()
  }

  async updateTaskStatus(data: ITaskUpdateStatusRequest): Promise<ITask> {
    if (data.status === TaskStatus.Done && typeof data.outcome !== 'boolean') {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        "'outcome' field should be defined"
      )
    }

    /*
      Prefer dot notation query to query containing object
      { context: { a: 'foo', b: 123}} -> {"context.a": "foo", "context.b": 123}
      See KOMGO-2738 where query with context object containing valid values returned no Tasks
      -> Broke 'Complete Review' flow where Task status should be updated.
    */
    const query = { ...toDotNotation('context', data.context), taskType: data.taskType }

    // Fail under the following circumstances:
    // 1) task does not exist
    // 2) status is already in Done
    const currentTask = await TaskRepository.findOne(query).exec()
    if (!currentTask) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, TASK_NOT_FOUND_ERROR)
    }
    if (currentTask.status === TaskStatus.Done) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'Can\'t update status in task with status "Done"'
      )
    }

    // Perform update atomically with findAndModify
    // note #1: ITaskUpdateStatusRequest has an optional summary field. By default, if summary is not present, mongoose
    //   will populate summary: null and override existing values in mongo.
    //   To avoid that and *update only defined fields*, we need to use omitUndefined: true
    // note #2: omitUndefined isn't specified in mongoose types, hence ts-ignore to supress false error
    // @ts-ignore
    const updatedTask = await TaskRepository.findOneAndUpdate(query, data, { new: true, omitUndefined: true }).exec()
    if (!updatedTask) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, TASK_NOT_FOUND_ERROR)
    }

    return updatedTask
  }
}
