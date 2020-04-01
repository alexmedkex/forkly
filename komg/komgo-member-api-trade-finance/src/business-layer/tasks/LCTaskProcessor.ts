import { ILC } from '../../data-layer/models/ILC'
import { LC_STATE } from '../events/LC/LCStates'
import { COMPANY_LC_ROLE } from '../CompanyRole'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../inversify/types'
import { TaskManager, TaskStatus, NotificationManager, ITask, ITaskCreateRequest } from '@komgo/notification-publisher'
import { ILCTaskFactory } from './LCTaskFactory'
import { getTasksConfigs, ITaskConfig } from './LCTasksConfig'
import * as _ from 'lodash'
import { getLogger } from '@komgo/logging'
import { ITaskCreateData } from './ITaskCreateData'
import { getLCStateUpdateNotification } from '../messaging/notifications/notificationBuilder'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { CONFIG } from '../../inversify/config'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { MicroserviceConnectionException } from '../../exceptions'

export interface ILCTaskProcessor {
  updateTask(lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE, taskStatus: TaskStatus)
  createTask(lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE): Promise<ITaskCreateData>
  resolveTask(lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE)
  sendStateUpdatedNotification(lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE, performerId: string)
}

@injectable()
export class LCTaskProcessor implements ILCTaskProcessor {
  private logger = getLogger('LCTaskProcessor')
  private readonly taskConfig: ITaskConfig[]

  constructor(
    @inject(CONFIG.CompanyStaticId) private readonly companyId: string,
    @inject(TYPES.TaskManagerClient) private readonly taskManager: TaskManager,
    @inject(TYPES.LCTaskFactory) private readonly LCTaskFactory: ILCTaskFactory,
    @inject(TYPES.NotificationManagerClient) private readonly notificationManger: NotificationManager,
    @inject(TYPES.CompanyRegistryService) private readonly companyRegistryService: ICompanyRegistryService,
    @inject(CONFIG.KapsuleUrl) protected readonly kapsuleBaseUrl: string
  ) {
    this.taskConfig = getTasksConfigs(kapsuleBaseUrl)
  }

  async createTask(lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE): Promise<ITaskCreateData> {
    this.logger.info('resolving task to send', this.getLCMetaData(lc, state, role))

    const task = _.find(
      this.taskConfig,
      (t: ITaskConfig) => t.key.lcStatus === state && t.key.role === role && (!t.check || t.check(lc))
    ) as ITaskConfig

    if (!task || !task.createTask) {
      this.logger.info('no task to create', this.getLCMetaData(lc, state, role))

      return null
    }

    this.logger.info('creating task', {
      ...this.getLCMetaData(lc, state, role)
    })
    const taskData = await this.LCTaskFactory.getTask(task.createTask, lc)
    if (task.emailTemplateData) {
      taskData.task.emailData = task.emailTemplateData
    }
    await this.taskManager.createTask(taskData.task, taskData.notification.message)

    return taskData
  }

  async resolveTask(lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE) {
    this.logger.info('resolving task to complete', this.getLCMetaData(lc, state, role))

    this.updateTask(lc, state, role, TaskStatus.Done)
  }

  async updateTask(lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE, taskStatus: TaskStatus): Promise<ITask> {
    const task = _.find(
      this.taskConfig,
      (t: ITaskConfig) => t.key.lcStatus === state && t.key.role === role && (!t.check || t.check(lc))
    ) as ITaskConfig
    this.logger.info('updateTask status', { task, taskStatus, ...this.getLCMetaData(lc, state, role) })
    if (!task || !task.resolveTask) {
      this.logger.info('no task to update', this.getLCMetaData(lc, state, role))
      return
    }
    const taskContext = this.LCTaskFactory.getTaskContext(task.resolveTask.taskType, lc)
    return this.taskManager.updateTaskStatus({
      status: taskStatus,
      taskType: task.resolveTask.taskType,
      context: taskContext,
      outcome: task.resolveTask.outcome
    })
  }

  async sendStateUpdatedNotification(lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE, performerId: string) {
    if (this.companyId === performerId) {
      // do not send notif if I performed this state transition
      return
    }

    this.logger.info('Sending notification', this.getLCMetaData(lc, state, role))
    const notification = getLCStateUpdateNotification(lc, state, role, await this.getCompanyName(performerId))
    try {
      return this.notificationManger.createNotification(notification)
    } catch (err) {
      this.logger.error(ErrorCode.ConnectionMicroservice, ErrorNames.LCSendNotificationFailed, err.message, {
        ...this.getLCMetaData(lc, state, role)
      })
      throw new MicroserviceConnectionException('Error sending notification')
    }
  }

  private getLCMetaData(lc: ILC, state: LC_STATE, role: COMPANY_LC_ROLE) {
    return { LC_STATE: state, LC: lc && lc._id ? lc._id.toString() : null, companyRole: role }
  }

  private async getCompanyName(companyId: string) {
    const resp = await this.companyRegistryService.getMember(companyId)

    if (!resp || !resp.data || !resp.data[0]) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LCTaskProcessorCompanyNotFound,
        `Can't find company with staticId: ${companyId}`,
        {
          staticId: companyId
        }
      )
      return null
    }

    const company = resp.data[0]

    return company.x500Name.CN
  }
}
