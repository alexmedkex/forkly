import { LC_TASK_TYPE } from './LCTaskType'
import { ILC } from '../../data-layer/models/ILC'
import { TaskStatus } from '@komgo/notification-publisher'
import { injectable, inject } from 'inversify'
import { ITaskCreateData } from './ITaskCreateData'
import * as moment from 'moment'
import { TRADE_FINANCE_PRODUCT_ID, TRADE_FINANCE_ACTION } from './permissions'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { TYPES } from '../../inversify/types'
import { LC_STATE } from '../events/LC/LCStates'

export interface ILCTaskFactory {
  getTaskContext(type: LC_TASK_TYPE, lcData: ILC)
  getTask(type: LC_TASK_TYPE, lcData: ILC): Promise<ITaskCreateData>
}

@injectable()
export class LCTaskFactory implements ILCTaskFactory {
  private strategies = new Map<LC_TASK_TYPE, (type: LC_TASK_TYPE, lcData: ILC) => Promise<ITaskCreateData>>()

  constructor(
    @inject(TYPES.CompanyRegistryService) private readonly companyRegistryService: ICompanyRegistryService | any
  ) {
    this.setupStrategies()
  }

  getTaskContext(type: LC_TASK_TYPE, lcData: ILC) {
    return {
      type: 'LC',
      lcid: lcData._id.toString()
    }
  }

  getTask(type: LC_TASK_TYPE, lcData: ILC): Promise<ITaskCreateData> {
    return this.strategies.get(type)(type, lcData)
  }

  private setupStrategies(): any {
    this.strategies.set(LC_TASK_TYPE.ReviewLCApplication, this.getReviewLCApplication.bind(this))
    this.strategies.set(LC_TASK_TYPE.ReviewIssuedLC, this.getReviewIssuedLCTask.bind(this))
    this.strategies.set(LC_TASK_TYPE.ReviewAppRefusal, this.getReviewLCRefusal.bind(this))
    this.strategies.set(LC_TASK_TYPE.IssuedLCRefusal, this.getIssuedLCRefusal.bind(this))
    this.strategies.set(LC_TASK_TYPE.ManagePresentation, this.getManagePresentation.bind(this))
  }

  private async getReviewLCApplication(type: LC_TASK_TYPE, lcData: ILC): Promise<ITaskCreateData> {
    const taskData = await this.buildCommonTaskData(type, lcData, lcData.applicantId)

    const task = {
      summary: `Review LC application`,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId: TRADE_FINANCE_ACTION.ReviewLCApplication
      },
      dueAt: moment()
        .add(1, 'days')
        .toDate(),
      ...taskData
    }

    const applicantName = await this.getCompanyName(lcData.applicantId)

    return {
      task,
      notification: {
        message: `Request for L/C by ${applicantName} received for review`
      }
    }
  }

  private async getReviewIssuedLCTask(type: LC_TASK_TYPE, lcData: ILC): Promise<ITaskCreateData> {
    const taskData = await this.buildCommonTaskData(type, lcData, lcData.issuingBankId)

    const task = {
      summary: `Review the L/C for your trade which the bank has sent`,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId: TRADE_FINANCE_ACTION.ReviewIssuedLC
      },
      dueAt: moment()
        .add(1, 'days')
        .toDate(),
      ...taskData
    }

    let notificationMessage: string

    if (lcData.status === LC_STATE.ADVISED) {
      const bankName = await this.getCompanyName(lcData.beneficiaryBankId)

      notificationMessage = `L/C advised by ${bankName} (${lcData.reference})`
    } else {
      const bankName = await this.getCompanyName(lcData.issuingBankId)

      notificationMessage = `L/C issued by ${bankName} (${lcData.reference})`
    }

    return {
      task,
      notification: {
        message: notificationMessage
      }
    }
  }

  private async getReviewLCRefusal(type: LC_TASK_TYPE, lcData: ILC): Promise<ITaskCreateData> {
    const taskData = await this.buildCommonTaskData(type, lcData, lcData.issuingBankId)

    const task = {
      summary: `Review the banks refusal of an L/C and the reasons associated`,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId: TRADE_FINANCE_ACTION.ReviewIssuedLC
      },
      dueAt: moment()
        .add(1, 'days')
        .toDate(),
      ...taskData
    }

    const issuingBankName = await this.getCompanyName(lcData.issuingBankId)

    return {
      task,
      notification: {
        message: `Request for L/C rejected by ${issuingBankName}`
      }
    }
  }

  private async getIssuedLCRefusal(type: LC_TASK_TYPE, lcData: ILC): Promise<ITaskCreateData> {
    const taskData = await this.buildCommonTaskData(type, lcData, lcData.issuingBankId)

    const task = {
      summary: `Review the refusal of an issued L/C and the reasons associated`,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId: TRADE_FINANCE_ACTION.ReviewLC
      },
      dueAt: moment()
        .add(1, 'days')
        .toDate(),
      ...taskData
    }

    return {
      task,
      notification: {
        message: `Issued L/C has been rejected`
      }
    }
  }

  private async getManagePresentation(type: LC_TASK_TYPE, lcData: ILC): Promise<ITaskCreateData> {
    const taskData = await this.buildCommonTaskData(type, lcData, lcData.issuingBankId)

    const task = {
      summary: `Begin presentation for L/C`,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId: TRADE_FINANCE_ACTION.ManagePresentation
      },
      ...taskData
    }

    return {
      task,
      notification: {
        message: `Manage collection of documents for presentation`
      }
    }
  }

  private async buildCommonTaskData(type: LC_TASK_TYPE, lcData: ILC, partyId: string) {
    const context = this.getTaskContext(type, lcData)
    return {
      taskType: type,
      status: TaskStatus.ToDo,
      counterpartyStaticId: partyId,
      context
    }
  }

  private async getCompanyName(companyId: string) {
    await this.companyRegistryService.getMember(companyId)
    const company = await this.companyRegistryService
      .getMember(companyId)
      .then(resp => (resp && resp.data ? resp.data[0] : null))

    return company ? company.x500Name.CN : ''
  }
}
