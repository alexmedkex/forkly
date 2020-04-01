import { ISBLCEventService } from './ISBLCEventService'
import { ISBLCCreatedEvent } from './ISBLCCreatedEvent'
import { IStandbyLetterOfCredit, StandbyLetterOfCreditTaskType, CompanyRoles } from '@komgo/types'
import { ISBLCDataAgent } from '../../../data-layer/data-agents'
import { unmanaged, injectable } from 'inversify'
import {
  TaskStatus,
  ITaskCreateRequest,
  TaskManager,
  NotificationManager,
  NotificationLevel
} from '@komgo/notification-publisher'
import { TRADE_FINANCE_PRODUCT_ID, TRADE_FINANCE_ACTION } from '../../tasks/permissions'
import { HashMetaDomain } from '../../common/HashFunctions'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import { ISBLCDocumentManager } from './SBLCDocumentManager'

@injectable()
export abstract class SBLCBaseEventService implements ISBLCEventService {
  protected logger

  constructor(
    logger: any,
    @unmanaged() protected readonly dataAgent: ISBLCDataAgent,
    @unmanaged() protected readonly companyStaticId: string,
    @unmanaged() private readonly taskManager: TaskManager,
    @unmanaged() private readonly notificationManger: NotificationManager,
    @unmanaged() private readonly companyRegistryService: ICompanyRegistryService,
    @unmanaged() protected readonly sblcDocumentManager: ISBLCDocumentManager,
    @unmanaged() protected readonly kapsuleBaseUrl: string
  ) {
    this.logger = logger
  }

  abstract async doEvent(sblc: IStandbyLetterOfCredit, decodedEvent: ISBLCCreatedEvent, rawEvent: any)

  protected async createNotification(
    sblc: IStandbyLetterOfCredit,
    message: string,
    additionalContext: any,
    type: StandbyLetterOfCreditTaskType
  ) {
    const context = {
      ...this.buildContext(sblc),
      ...additionalContext
    }
    await this.notificationManger.createNotification({
      context,
      level: NotificationLevel.info,
      productId: TRADE_FINANCE_PRODUCT_ID,
      type,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId: TRADE_FINANCE_ACTION.ReviewSBLC
      },
      message
    })
  }

  protected async createTask(
    sblc: IStandbyLetterOfCredit,
    taskText: string,
    taskType: StandbyLetterOfCreditTaskType,
    subject?: string,
    emailTaskTitle?: string,
    emailTaskLink?: string
  ) {
    const taskRequest: ITaskCreateRequest = {
      summary: taskText,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId: TRADE_FINANCE_ACTION.ReviewSBLC
      },
      status: TaskStatus.ToDo,
      context: this.buildContext(sblc),
      taskType
    }
    if (subject && emailTaskTitle && emailTaskLink) {
      taskRequest.emailData = {
        subject,
        taskLink: emailTaskLink,
        taskTitle: emailTaskTitle
      }
    }
    try {
      await this.taskManager.createTask(taskRequest, taskText)
    } catch (error) {
      this.logger.error({
        error: 'SBLCCreateTaskFailed',
        errorObject: error
      })
      return
    }
  }

  protected async resolveTask(sblc: IStandbyLetterOfCredit, taskType: StandbyLetterOfCreditTaskType, outcome: boolean) {
    const context = this.buildContext(sblc)
    this.logger.info('Resolving task', {
      sblcStaticId: sblc.staticId,
      taskType
    })
    const tasks = await this.taskManager.getTasks({
      taskType,
      context
    })

    if (!tasks || !tasks.length) {
      this.logger.warn('No task found for resolving', {
        sblc,
        taskType,
        context
      })
      return
    }
    const task = tasks.filter(t => t.status === TaskStatus.ToDo || t.status === TaskStatus.Pending)[0]

    if (!task) {
      this.logger.warn('No task found for resolving in TODO or PENDING status', {
        sblc,
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

  protected getCompanyRole(sblc: IStandbyLetterOfCredit): CompanyRoles {
    if (this.companyStaticId === sblc.applicantId) {
      return CompanyRoles.Applicant
    } else if (this.companyStaticId === sblc.issuingBankId) {
      return CompanyRoles.IssuingBank
    } else if (this.companyStaticId === sblc.beneficiaryId) {
      return CompanyRoles.Beneficiary
    } else {
      return CompanyRoles.UNKNOWN
    }
  }

  protected buildContext(sblc: IStandbyLetterOfCredit): any {
    return {
      type: 'IStandbyLetterOfCredit',
      sblcStaticId: sblc.staticId
    }
  }

  protected async getCompanyNameByStaticId(staticId: string): Promise<string> {
    const node = HashMetaDomain(staticId)
    const members: any[] = await this.companyRegistryService.getMembersByNode([node])
    if (!members || members.length === 0) {
      throw new Error(`Member not found for staticId=${staticId}`)
    }
    const member = members[0]
    if (!member.x500Name) {
      throw new Error(`Member does not have x500Name, staticId=${staticId}`)
    }
    return member.x500Name.CN
  }

  protected async isCompanyKomgoMember(staticId: string): Promise<string> {
    const node = HashMetaDomain(staticId)
    const members: any[] = await this.companyRegistryService.getMembersByNode([node])
    if (!members || members.length === 0) {
      throw new Error(`Member not found for staticId=${staticId}`)
    }
    const member = members[0]
    return member.isMember
  }
}
