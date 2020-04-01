import { injectable, inject } from 'inversify'

import { TaskManager, ITaskCreateRequest, TaskStatus } from '@komgo/notification-publisher'
import { ILetterOfCredit, LetterOfCreditTaskType, IDataLetterOfCredit } from '@komgo/types'
import { getLogger } from '@komgo/logging'
import { ErrorCode } from '@komgo/error-utilities'

import { TYPES } from '../../../inversify'
import { ErrorNames } from '../../../exceptions/utils'

import { TRADE_FINANCE_PRODUCT_ID, TRADE_FINANCE_ACTION } from '../../tasks/permissions'
import { IEmailNotificationOptions } from '../../common/types'

import { ILetterOfCreditTaskManager } from './ILetterOfCreditTaskManager'

@injectable()
export class LetterOfCreditTaskManager implements ILetterOfCreditTaskManager {
  private readonly taskManager: TaskManager
  private readonly logger = getLogger('LetterOfCreditTaskManager')

  constructor(@inject(TYPES.TaskManagerClient) taskManager: TaskManager) {
    this.taskManager = taskManager
  }

  public async createTask(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    taskText: string,
    taskType: LetterOfCreditTaskType,
    actionType: TRADE_FINANCE_ACTION,
    emailOptions?: IEmailNotificationOptions
  ) {
    try {
      let taskRequest: ITaskCreateRequest = this.getTaskRequest(letterOfCredit, taskText, taskType, actionType)

      if (emailOptions) {
        taskRequest = this.getAdditionalOptionsForEmailNotification(taskRequest, emailOptions)
      }

      await this.taskManager.createTask(taskRequest, taskText)
    } catch (error) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorNames.LetterOfCreditTaskManagerFailed, error)
      throw error
    }
  }

  public async resolveTask(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    taskType: LetterOfCreditTaskType,
    outcome: boolean
  ) {
    const context = this.buildContext(letterOfCredit)
    this.logger.info('Resolving task', {
      staticId: letterOfCredit.staticId,
      taskType
    })

    const tasks = await this.taskManager.getTasks({
      taskType,
      context
    })

    if (!tasks || !tasks.length) {
      this.logger.info('No task found for resolving', {
        letterOfCredit,
        taskType,
        context
      })
      return
    }

    const task = tasks.filter(t => t.status === TaskStatus.ToDo || t.status === TaskStatus.Pending)[0]

    if (!task) {
      this.logger.info('No task found for resolving', {
        letterOfCredit,
        taskType,
        context
      })
      return
    }

    await this.taskManager.updateTaskStatus({
      status: TaskStatus.Done,
      taskType: task.taskType,
      context: task.context,
      outcome
    })
  }

  private getAdditionalOptionsForEmailNotification(
    taskRequest: ITaskCreateRequest,
    emailOptions: IEmailNotificationOptions
  ): ITaskCreateRequest {
    const { subject, emailTaskTitle, emailTaskLink } = emailOptions
    if (subject && emailTaskTitle && emailTaskLink) {
      taskRequest.emailData = {
        subject,
        taskLink: emailTaskLink,
        taskTitle: emailTaskTitle
      }
    }
    return taskRequest
  }

  private buildContext(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): any {
    return {
      type: 'ILetterOfCredit',
      staticId: letterOfCredit.staticId
    }
  }

  private getTaskRequest(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    taskText: string,
    taskType: LetterOfCreditTaskType,
    actionType: TRADE_FINANCE_ACTION
  ): ITaskCreateRequest {
    return {
      summary: taskText,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId: actionType
      },
      status: TaskStatus.ToDo,
      context: this.buildContext(letterOfCredit),
      taskType
    }
  }
}
