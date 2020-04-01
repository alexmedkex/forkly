import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ITaskCreateRequest, TaskManager, TaskStatus, ITaskUpdateStatusRequest } from '@komgo/notification-publisher'
import { axiosRetry, exponentialDelay } from '@komgo/retry'
import { IEmailTemplateData } from '@komgo/types'
import * as AxiosError from 'axios-error'
import { inject, injectable } from 'inversify'

import { PRODUCT_ID } from '../../constants'
import { ErrorName } from '../../ErrorName'
import { TYPES, VALUES } from '../../inversify'
import { TaskError } from '../errors'
import { TaskType } from '../types'

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
    @inject(VALUES.KapsuleUrl) private readonly kapsuleUrl: string,
    private readonly retryDelay = 1000
  ) {}

  /**
   * Sends a new task
   *
   * @param task task to create
   * @param notificationMessage notification message to send when a task is created
   * @throws TaskError if fails to create a task
   */
  public async sendTask(task: ITaskCreateRequest, notificationMessage: string): Promise<void> {
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
      }
      this.processAxiosError('Failed to create a task', axiosError)
    }
  }

  /**
   * Updates the status of a task to Done
   *
   * @param taskType type of the task
   * @param assignee id of the user who completed the task
   * @param context context of the task
   */
  public async completeTask(taskType: TaskType, assignee: string, context: any): Promise<void> {
    const taskUpdateRequest: ITaskUpdateStatusRequest = {
      status: TaskStatus.Done,
      taskType,
      outcome: true,
      assignee,
      context
    }

    try {
      this.logger.info('Moving task status to Done', { taskContext: taskUpdateRequest })
      await axiosRetry(async () => this.taskManager.updateTaskStatus(taskUpdateRequest), {
        delay: exponentialDelay(this.retryDelay)
      })
    } catch (error) {
      const axiosError = new AxiosError(error)
      if (this.taskNotFound(axiosError)) {
        this.logger.warn(
          ErrorCode.ConnectionMicroservice,
          ErrorName.TaskNotFoundError,
          'Failed to resolve a task. A task does not exist',
          { context: taskUpdateRequest.context }
        )
        return
      }
      this.processAxiosError('Failed to update task status', axiosError)
    }

    this.logger.info('Task completed successfully')
  }

  /**
   * Creates a new task creation request
   *
   * @param taskType type of the task
   * @param summary summary of the task
   * @param senderStaticId static id of the counterparty
   * @param actionId action needed to perform the task
   * @param context context of the task
   */
  public createTaskRequest(
    taskType: TaskType,
    summary: string,
    senderStaticId: string,
    actionId: string,
    context: any,
    emailData?: IEmailTemplateData
  ): ITaskCreateRequest {
    return {
      summary,
      taskType,
      status: TaskStatus.ToDo,
      counterpartyStaticId: senderStaticId,
      requiredPermission: {
        productId: PRODUCT_ID,
        actionId
      },
      emailData,
      context: { ...context, senderStaticId }
    }
  }

  /**
   * Creates a new email object
   *
   * @param taskTitle title of the task
   * @param subject email subject. Default 'Risk Cover / Receivable Discounting'
   */
  public resolveTaskEmail(
    taskTitle: string,
    subject: string = 'Risk Cover / Receivable Discounting'
  ): IEmailTemplateData {
    return {
      subject,
      taskTitle,
      taskLink: this.getTaskBaseUrl()
    }
  }

  private getTaskBaseUrl() {
    return `${this.kapsuleUrl}/tasks`
  }

  private isDuplicatedTask(axiosError: AxiosError): boolean {
    return axiosError.response.status === DUPLICATED_TASK_ERROR_CODE
  }
  private taskNotFound(axiosError: AxiosError): boolean {
    return axiosError.response.status === TASK_NOT_FOUND_ERROR_CODE
  }

  private processAxiosError(errorMsg: string, error: AxiosError): never {
    this.logger.error(ErrorCode.ConnectionMicroservice, ErrorName.TaskError, 'Error calling the Tasks API', {
      errorMessage: error.message,
      axiosResponse: error.response ? error.response.data : '<none>'
    })
    throw new TaskError(`${errorMsg}. ${error.message}`)
  }
}
