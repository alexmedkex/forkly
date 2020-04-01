import { ILCAmendmentEventService } from './ILCAmendmentEventService'
import { ILCAmendment, LCAmendmentTaskType } from '@komgo/types'
import { inject, injectable } from 'inversify'
import { CONFIG } from '../../../inversify/config'
import { TYPES } from '../../../inversify/types'
import { ILCCacheDataAgent, ILCAmendmentDataAgent } from '../../../data-layer/data-agents'
import {
  TaskManager,
  TaskStatus,
  ITaskCreateRequest,
  NotificationManager,
  NotificationLevel
} from '@komgo/notification-publisher'
import { getLogger } from '@komgo/logging'
import { TRADE_FINANCE_PRODUCT_ID, TRADE_FINANCE_ACTION } from '../../tasks/permissions'
import { ILCDocumentManager } from '../LC/LCTransitionEvents/LCDocumentManager'
import { ILC } from '../../../data-layer/models'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'

@injectable()
export abstract class LCAmendmentEventServiceBase implements ILCAmendmentEventService {
  protected logger = getLogger('LCAmendmentEventService')

  constructor(
    @inject(TYPES.LCAmendmentDataAgent) protected readonly lcAmendmentDataAgent: ILCAmendmentDataAgent,
    @inject(CONFIG.CompanyStaticId) protected readonly companyStaticId: string,
    @inject(TYPES.TaskManagerClient) protected readonly taskManager: TaskManager,
    @inject(TYPES.NotificationManagerClient) private readonly notificationManger: NotificationManager,
    @inject(TYPES.LCCacheDataAgent) protected readonly lcDataAgent: ILCCacheDataAgent,
    @inject(TYPES.LCDocumentManager) protected readonly lcDocumentManager: ILCDocumentManager
  ) {}

  abstract async doEvent(amendment: ILCAmendment, decodedEvent: any, rawEvent: any): Promise<any>

  protected async resolveTask(amendment: ILCAmendment, taskType: LCAmendmentTaskType, outcome: boolean) {
    const context = this.buildContext(amendment)
    this.logger.info('Resolving task', {
      amendmentStaticId: amendment.staticId,
      taskType
    })
    const tasks = await this.taskManager.getTasks({
      taskType,
      context
    })

    if (!tasks || !tasks.length) {
      this.logger.warn(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.NoTaskFoundForResolving,
        'No task found for resolving',
        {
          amendment,
          taskType,
          context
        }
      )
      return
    }
    const task = tasks.filter(t => t.status === TaskStatus.ToDo || t.status === TaskStatus.Pending)[0]

    if (!task) {
      this.logger.warn(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.NoTaskFoundForResolvingTodoOrPending,
        'No task found for resolving in TODO or PENDING status',
        {
          amendment,
          taskType,
          context
        }
      )
      return
    }

    await this.taskManager.updateTaskStatus({
      status: TaskStatus.Done,
      taskType: task.taskType,
      context: task.context,
      outcome
    })
  }

  protected iAmIssuingBank(lc: ILC) {
    return lc.issuingBankId === this.companyStaticId
  }

  protected iAmBeneficiaryWithoutAdvising(lc: ILC) {
    return !lc.beneficiaryBankId && lc.beneficiaryId === this.companyStaticId
  }

  protected iAmBeneficiary(lc: ILC) {
    return lc.beneficiaryId === this.companyStaticId
  }

  protected iAmAdvisingBank(lc: ILC) {
    return lc.beneficiaryBankId && lc.beneficiaryBankId === this.companyStaticId
  }

  protected iAmApplicant(lc: ILC) {
    return lc.applicantId === this.companyStaticId
  }

  protected async createNotification(amendment: ILCAmendment, message: string, additionalContext: any) {
    const context = {
      ...this.buildContext(amendment),
      ...additionalContext
    }
    await this.notificationManger.createNotification({
      context,
      level: NotificationLevel.info,
      productId: TRADE_FINANCE_PRODUCT_ID,
      type: LCAmendmentTaskType.ReviewAmendment,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId: TRADE_FINANCE_ACTION.ManageLCRequest
      },
      message
    })
  }

  protected async createTask(amendment: ILCAmendment, taskText: string, taskType: LCAmendmentTaskType) {
    const taskRequest: ITaskCreateRequest = {
      summary: taskText,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId: TRADE_FINANCE_ACTION.ManageLCRequest
      },
      status: TaskStatus.ToDo,
      context: this.buildContext(amendment),
      taskType
    }
    try {
      await this.taskManager.createTask(taskRequest, taskText)
    } catch (error) {
      return
    }
  }

  protected buildContext(amendment: ILCAmendment): any {
    return {
      type: 'LCAmendment',
      lcAmendmentId: amendment.staticId,
      lcReference: amendment.lcReference
    }
  }
}
