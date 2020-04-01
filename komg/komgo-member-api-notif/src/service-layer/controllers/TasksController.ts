import { Body, Controller, Get, Header, Patch, Path, Post, Query, Response, Route, Security, Tags } from 'tsoa'
import { getLogger } from '@komgo/logging'
import { requestStorageInstance, ErrorUtils } from '@komgo/microservice-config'

import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ITaskDataAgent } from '../../data-layer/data-agents/interfaces/ITaskDataAgent'
import { getPermissionsByToken } from '../../data-layer/utils/getPermissionsByToken'
import { getUserById } from '../../data-layer/utils/getUserById'
import {
  ITask,
  ITaskUpdateAssigneeRequest,
  ITaskUpdateStatusRequest,
  ITaskWithMessageCreateRequest,
  TaskStatus
} from '../request/task'
import { IEmailService } from '../../business-layer/emails/EmailService'
import { INotificationCreateRequest, NotificationLevel } from '../request/notification'
import { ITaskResponse } from '../responses/task'
import { decodeBearerToken, IDecodedJWT } from '../../data-layer/utils/decodeBearerToken'
import { NotificationsController } from './NotificationsController'
import { INotificationDataAgent } from '../../data-layer/data-agents/interfaces/INotificationDataAgent'
import { getUserIDsByPermission, getUsersByPermission } from '../../data-layer/utils/getUsersByPermission'
import { flattenFieldQuery, parseJSONParam } from '../utils/queryStringUtils'
import { IMessagePublisher } from '@komgo/messaging-library'
import { IUser } from '@komgo/types'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../utils/ErrorName'

const HTTP_NOT_FOUND = 404
const invalidJwtToken = 'invalid jwt token'
const invalidParams = 'invalid params'
const uiAction = {
  newTask: '@@tasks/NEW_TASK',
  replaceTask: '@@task/TASK_REPLACE'
}

/**
 * Task Routes Class
 * @export
 * @class TasksController
 * @extends {Controller}
 */
@Tags('Tasks')
@Route('tasks')
@provideSingleton(TasksController)
export class TasksController extends Controller {
  private notificationController: NotificationsController
  private readonly logger = getLogger('NotificationsController')

  constructor(
    @inject(TYPES.TaskDataAgent) private readonly taskDataAgent: ITaskDataAgent,
    @inject(TYPES.NotificationDataAgent) private readonly notificationDataAgent: INotificationDataAgent,
    @inject(TYPES.MessagePublisher) private readonly messagePublisher: IMessagePublisher,
    @inject(TYPES.EmailService) private readonly emailService: IEmailService
  ) {
    super()
    this.notificationController = new NotificationsController(notificationDataAgent, messagePublisher, emailService)
  }

  /**
   * @summary returns tasks of a current user
   */
  @Security('signedIn')
  @Response('400', invalidJwtToken)
  @Response('400', invalidParams)
  @Get()
  public async GetTasks(
    @Header('Authorization') token: string,
    @Query('status') status?: TaskStatus
  ): Promise<ITaskResponse[]> {
    const permissions: any[] = await getPermissionsByToken(token)

    const tasks: ITask[] = await this.taskDataAgent.getTasks({
      ...(status ? { status } : {}),
      requiredPermission: { $in: permissions }
    })

    return Promise.all(
      tasks.map(async (task: ITask) => ({ task, user: task.assignee ? await this.getUserById(task.assignee) : null }))
    )
  }

  /**
   * @summary returns all tasks filtered by status, taskType, and context
   */
  @Security('internal')
  @Get('/internal')
  public async GetTasksInternal(
    @Query('status') status?: TaskStatus,
    @Query('taskType') taskType?: string,
    @Query('context') context?: string
  ): Promise<ITask[]> {
    const query = {
      ...(status && { status }),
      ...(context && { ...flattenFieldQuery(parseJSONParam(context, 'context'), 'context') }),
      ...(taskType && { taskType })
    }
    return this.taskDataAgent.getTasks(query)
  }

  /**
   * @summary returns task by id
   */
  @Security('signedIn')
  @Response('400', invalidJwtToken)
  @Response('400', invalidParams)
  @Get('{taskId}')
  public async GetTask(@Header('Authorization') token: string, @Path() taskId: string): Promise<ITaskResponse> {
    const permissions: any[] = await getPermissionsByToken(token)
    const task: ITask = await this.taskDataAgent.getTask(taskId)
    const isPermitted = this.getPermitted(permissions, task)
    if (isPermitted) {
      return { task, user: task.assignee ? await this.getUserById(task.assignee) : null }
    } else {
      throw ErrorUtils.forbiddenException(
        ErrorCode.ValidationHttpContent,
        "You don't have permissions to view this task"
      )
    }
  }

  /**
   * @summary creates a new task
   * @description Create task and send notification to group of users with body.task.requiredPermission
   * @param body task.assignee: default null,
   * task.outcome: default false,
   * task.Status: default 'To Do'
   */
  @Security('internal')
  @Response('409', 'Task with the provided content already exists')
  @Response('400', 'required field is missing')
  @Post()
  public async CreateNewTask(@Body() body: ITaskWithMessageCreateRequest): Promise<ITask> {
    const createdTask: ITask = await this.taskDataAgent.createTask(body.task)
    // we won't wait until notification is sent
    this.sendNotification(createdTask, body.message)
      .then()
      .catch()

    const users = await getUsersByPermission(body.task.requiredPermission)
    await this.emailService.sendTaskEmail(users, body.task.emailData, createdTask)

    await this.publishWSMessagesByTask(createdTask, uiAction.newTask)
    return createdTask
  }

  /**
   * @summary updates task assignee
   * @param token Token
   * @param taskId Task Id
   * @param req req.assignee userId
   */
  @Security('signedIn')
  @Response('422', 'assignee should contains valid userId value')
  @Response('403', "You don't have permissions to update this task")
  @Response('403', 'This user can not be assigned to this task')
  @Response('404', 'Task not found')
  @Response('400', 'required field is missing')
  @Response('400', invalidJwtToken)
  @Patch('{taskId}/assignee')
  public async UpdateTaskAssignee(
    @Header('Authorization') token: string,
    @Path() taskId: string,
    @Body() req: ITaskUpdateAssigneeRequest
  ): Promise<ITaskResponse> {
    const permissions: any = await getPermissionsByToken(token)
    const user: IDecodedJWT = decodeBearerToken(token)
    const task: ITask = await this.taskDataAgent.getTask(taskId)
    const assignee = req.assignee || null
    const selectedUser = await this.getUser(assignee)
    const isPermitted = this.getPermitted(permissions, task)
    if (!isPermitted) {
      throw ErrorUtils.forbiddenException(
        ErrorCode.ValidationHttpContent,
        "You don't have permissions to update this task"
      )
    }
    if (assignee) {
      const users: string[] = await getUserIDsByPermission(task.requiredPermission)
      const assigneeUser = users.some(usr => usr === assignee)
      if (!assigneeUser) {
        throw ErrorUtils.forbiddenException(
          ErrorCode.ValidationHttpContent,
          'This user can not be assigned to this task'
        )
      }
    }
    const updatedTask = await this.taskDataAgent.updateTaskAssignee(taskId, { assignee })
    const you = updatedTask.assignee ? 'you' : 'the Unassigned group'
    const assigned = task.assignee ? 're-assigned' : 'assigned'
    const message = `${user.name} has ${assigned} the task "${updatedTask.summary}" to ${you}`
    this.sendNotification(updatedTask, message)
      .then()
      .catch()
    await this.publishWSMessagesByTask(updatedTask, uiAction.replaceTask)
    return { task: updatedTask, user: selectedUser }
  }

  /**
   * @summary updates task status
   */
  @Security('internal')
  @Response('404', 'Task not found')
  @Response('422', 'outcome is not defined')
  @Response('422', 'task is already done')
  @Response('400', invalidJwtToken)
  @Patch()
  public async UpdateTaskStatus(@Body() req: ITaskUpdateStatusRequest): Promise<ITask> {
    const task = await this.taskDataAgent.updateTaskStatus(req)
    await this.publishWSMessagesByTask(task, uiAction.replaceTask)
    return task
  }

  private async getUserById(id: string): Promise<IUser | null> {
    let userResponse: any
    try {
      userResponse = await getUserById(id)
    } catch (e) {
      if (this.isAxiosError(e) && e.response.status === HTTP_NOT_FOUND) {
        return null
      }
      throw e
    }

    return userResponse.data
  }

  private async sendNotification(task, message: string) {
    const newNotification: INotificationCreateRequest = {
      productId: task.requiredPermission.productId,
      type: task.taskType,
      level: NotificationLevel.warning,
      context: { taskId: task._id },
      message,
      ...(task.assignee ? { toUser: task.assignee } : { requiredPermission: task.requiredPermission })
    }
    try {
      await this.notificationController.CreateNewNotification(newNotification)
    } catch (e) {
      this.logger.error(ErrorCode.Connection, ErrorName.notificationCreationError, e.message, { stacktrace: e.stack })
    }
  }

  private async publishWSMessagesByTask(task: ITask, actionType: string) {
    const users = await getUsersByPermission(task.requiredPermission)
    const taskUser = task.assignee ? await this.getUserById(task.assignee) : null
    const taskWithUser: ITaskResponse = {
      task,
      user: taskUser
    }
    await Promise.all(users.map(user => this.publishWSMessage(taskWithUser, user, actionType)))
  }

  private async publishWSMessage(taskWithUser: ITaskResponse, recipient: IUser, actionType: string) {
    const requestId = requestStorageInstance.get('requestId')
    this.logger.info('new message')
    try {
      await this.messagePublisher.publish(
        'INTERNAL.WS.action',
        { recipient: recipient.id, type: actionType, version: '1', payload: taskWithUser },
        { requestId }
      )
    } catch (e) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.publishMessageFailed, e.message, {
        taskId: taskWithUser.task._id.toString(),
        stacktrace: e.stack
      })
    }
  }

  private isAxiosError(err: any) {
    return err.response && err.response.status
  }

  private async getUser(assignee) {
    let result: IUser | null
    if (assignee) {
      result = await this.getUserById(assignee)
      if (!result) {
        throw ErrorUtils.unprocessableEntityException(
          ErrorCode.ValidationHttpContent,
          'assignee should contain valid userId value'
        )
      }
    }
    return result
  }

  private getPermitted(permissions: any[], task: ITask) {
    return permissions.some(
      perm => perm.productId === task.requiredPermission.productId && perm.actionId === task.requiredPermission.actionId
    )
  }
}
