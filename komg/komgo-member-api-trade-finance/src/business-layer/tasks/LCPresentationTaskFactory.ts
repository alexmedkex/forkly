import { LCPresentationTaskType } from './LCPresentationTaskType'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { ITaskCreateData } from './ITaskCreateData'
import { injectable, inject } from 'inversify'
import { TaskStatus } from '@komgo/notification-publisher'
import { TRADE_FINANCE_PRODUCT_ID, TRADE_FINANCE_ACTION } from './permissions'
import * as moment from 'moment'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { TYPES } from '../../inversify/types'
import { ILC } from '../../data-layer/models/ILC'
import { ILCPresentationTaskContext } from './ILCPresentationTaskContext'
import { LCPresentationStatus } from '@komgo/types'

export interface ILCPresentationTaskFactory {
  getTaskContext(type: LCPresentationTaskType, data: ILCPresentation, lc: ILC)
  getTask(
    type: LCPresentationTaskType,
    data: ILCPresentation,
    lc: ILC,
    actionId: TRADE_FINANCE_ACTION
  ): Promise<ITaskCreateData>
}

@injectable()
export class LCPresentationTaskFactory implements ILCPresentationTaskFactory {
  private strategies = new Map<
    LCPresentationTaskType,
    (
      type: LCPresentationTaskType,
      data: ILCPresentation,
      lc: ILC,
      actionId: TRADE_FINANCE_ACTION
    ) => Promise<ITaskCreateData>
  >()

  constructor(@inject(TYPES.CompanyRegistryService) private readonly companyRegistryService: ICompanyRegistryService) {
    this.setupStrategies()
  }

  getTaskContext(type: LCPresentationTaskType, data: ILCPresentation, lc: ILC): ILCPresentationTaskContext {
    return {
      type: 'LCPresentation',
      lcPresentationStaticId: data.staticId.toString(),
      lcid: lc._id.toString()
    }
  }

  getTask(
    type: LCPresentationTaskType,
    data: ILCPresentation,
    lc: ILC,
    actionId: TRADE_FINANCE_ACTION
  ): Promise<ITaskCreateData> {
    return this.strategies.get(type)(type, data, lc, actionId)
  }

  private setupStrategies(): any {
    this.strategies.set(LCPresentationTaskType.ReviewPresentation, this.getReviewLCPresentation.bind(this))
    this.strategies.set(
      LCPresentationTaskType.ReviewDiscrepantPresentation,
      this.getReviewDiscrepantPresentation.bind(this)
    )
    this.strategies.set(LCPresentationTaskType.ViewPresentedDocuments, this.viewPresentedDocuments.bind(this))
    this.strategies.set(
      LCPresentationTaskType.ReviewPresentationDiscrepancies,
      this.reviewPresentationDiscrepancies.bind(this)
    )
  }

  private async getReviewLCPresentation(
    type: LCPresentationTaskType,
    data: ILCPresentation,
    lc: ILC,
    actionId: TRADE_FINANCE_ACTION = TRADE_FINANCE_ACTION.ReviewPresentation
  ): Promise<ITaskCreateData> {
    const taskData = await this.buildCommonTaskData(type, data, data.beneficiaryId, lc)

    const task = {
      summary: `Review document presentation #${data.reference} for LC ${data.LCReference}`,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId
      },
      dueAt: moment()
        .add(5, 'days')
        .toDate(),
      ...taskData
    }

    const companyId =
      data.status === LCPresentationStatus.DocumentsCompliantByNominatedBank ? data.nominatedBankId : data.beneficiaryId

    const companyName = await this.getCompanyName(companyId)

    return {
      task,
      notification: {
        message: `Documents presentation #${data.reference} received from ${companyName}`
      }
    }
  }

  private async getReviewDiscrepantPresentation(
    type: LCPresentationTaskType,
    data: ILCPresentation,
    lc: ILC,
    actionId: TRADE_FINANCE_ACTION = TRADE_FINANCE_ACTION.ManagePresentation
  ): Promise<ITaskCreateData> {
    const bankId =
      data.status === LCPresentationStatus.DocumentsCompliantByNominatedBank ? data.nominatedBankId : data.issuingBankId

    const taskData = await this.buildCommonTaskData(type, data, bankId, lc)

    const task = {
      summary: `Review discrepancy reasons for document presentation #${data.reference} for LC ${data.LCReference}`,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId
      },
      ...taskData
    }

    const bankName = await this.getCompanyName(bankId)

    return {
      task,
      notification: {
        message: `Documents presentation #${data.reference} has been deemed as disrepant by ${bankName}`
      }
    }
  }

  private async reviewPresentationDiscrepancies(
    type: LCPresentationTaskType,
    data: ILCPresentation,
    lc: ILC,
    actionId: TRADE_FINANCE_ACTION = TRADE_FINANCE_ACTION.ManagePresentation
  ): Promise<ITaskCreateData> {
    const bankId =
      data.status === LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank
        ? data.nominatedBankId
        : data.issuingBankId

    const taskData = await this.buildCommonTaskData(type, data, bankId, lc)

    const task = {
      summary: `Review document discrepancies for presentation #${data.reference} for LC ${data.LCReference}`,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId
      },
      ...taskData
    }

    const bankName = await this.getCompanyName(bankId)

    return {
      task,
      notification: {
        message: `Documents discrepancies for presentation #${data.reference} has been advised by ${bankName}`
      }
    }
  }

  private async viewPresentedDocuments(
    type: LCPresentationTaskType,
    data: ILCPresentation,
    lc: ILC,
    actionId: TRADE_FINANCE_ACTION = TRADE_FINANCE_ACTION.ManagePresentation
  ): Promise<ITaskCreateData> {
    const taskData = await this.buildCommonTaskData(type, data, data.beneficiaryId, lc)

    const task = {
      summary: `View presented documents, presentation #${data.reference} for LC ${data.LCReference}`,
      requiredPermission: {
        productId: TRADE_FINANCE_PRODUCT_ID,
        actionId
      },
      ...taskData
    }

    const beneficiaryName = await this.getCompanyName(data.beneficiaryId)

    return {
      task,
      notification: {
        message: `Documents presentation #${data.reference} received from ${beneficiaryName}`
      }
    }
  }

  private async buildCommonTaskData(type: LCPresentationTaskType, data: ILCPresentation, partyId: string, lc: ILC) {
    const context = this.getTaskContext(type, data, lc)
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
