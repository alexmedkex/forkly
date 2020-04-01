import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ITaskCreateRequest, ITaskUpdateStatusRequest, TaskManager } from '@komgo/notification-publisher'
import { axiosRetry, exponentialDelay } from '@komgo/retry'
import * as AxiosError from 'axios-error'
import { inject, injectable } from 'inversify'

import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/ErrorName'

import TaskError from './TaskError'

const UNPROCESSABLE_ENTITY = 422
const DUPLICATED_TASK_ERROR_CODE = 409
const TASK_NOT_FOUND_ERROR_CODE = 404

/**
 * Client to create and update tasks.
 */
@injectable()
export class TaskClient {
  private readonly logger = getLogger('TaskClient')

  constructor(
    @inject(TYPES.TaskManager) private readonly taskManager: TaskManager,
    private readonly retryDelay = 1000
  ) {}

  /**
   * Create a new task
   * @param task task to create
   * @param notificationType type a notification to create with the task
   * @param notificationMessage notification message to send when a task is created
   * @throws TaskError if fails to create a task
   */
  public async createTask(task: ITaskCreateRequest, notificationMessage: string): Promise<void> {
    try {
      this.logger.info('Creating a task %s with context: ', task.taskType, task.context)
      await axiosRetry(async () => this.taskManager.createTask(task, notificationMessage), {
        delay: exponentialDelay(this.retryDelay)
      })
    } catch (error) {
      const axiosError = new AxiosError(error)
      if (this.isDuplicatedTask(axiosError)) {
        this.logger.warn(
          ErrorCode.ConnectionMicroservice,
          ErrorName.TaskAlreadyCreated,
          'Attempted to create a duplicated task with context',
          { context: task.context }
        )
        return
      } else if (this.unprocessableTaskCreation(axiosError)) {
        this.logger.warn(
          ErrorCode.ConnectionMicroservice,
          ErrorName.TaskCreationFormat,
          'Task creation attempted, wrong format',
          { task }
        )
        return
      }
      this.processAxiosError('Failed to create a task', axiosError)
    }
  }

  public async updateTaskStatus(task: ITaskUpdateStatusRequest): Promise<void> {
    try {
      this.logger.info('Updating a task status')
      await axiosRetry(async () => this.taskManager.updateTaskStatus(task), {
        delay: exponentialDelay(this.retryDelay)
      })
    } catch (error) {
      const axiosError = new AxiosError(error)
      if (this.taskNotFound(axiosError)) {
        this.logger.warn(
          ErrorCode.ConnectionMicroservice,
          ErrorName.TaskError,
          'Failed to resolve a task. A task does not exist',
          { context: task.context }
        )
        return
      }
      this.processAxiosError('Failed to update a task status', axiosError)
    }
  }

  private isDuplicatedTask(axiosError: AxiosError): boolean {
    return axiosError.response.status === DUPLICATED_TASK_ERROR_CODE
  }

  private taskNotFound(axiosError: AxiosError): boolean {
    return axiosError.response.status === TASK_NOT_FOUND_ERROR_CODE
  }

  private unprocessableTaskCreation(axiosError: AxiosError): boolean {
    return axiosError.response.status === UNPROCESSABLE_ENTITY
  }

  private processAxiosError(errorMsg: string, error: AxiosError) {
    this.logger.error(ErrorCode.ConnectionMicroservice, ErrorName.TaskError, 'Error calling the Tasks API', {
      errorMessage: error.message,
      axiosResponse: this.getResponse(error)
    })

    throw new TaskError(`${errorMsg}. ${error.message}`)
  }

  private getResponse(error: AxiosError): any {
    if (error.response) return error.response.data
    return '<none>'
  }
}
