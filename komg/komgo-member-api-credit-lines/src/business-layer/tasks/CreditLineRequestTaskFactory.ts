import { TaskStatus } from '@komgo/notification-publisher'
import { tradeFinanceManager } from '@komgo/permissions'
import {
  ICreditLineRequest,
  IInformationShared,
  ISharedCreditLine,
  IProductContext,
  ISharedDepositLoan,
  DepositLoanType,
  IDepositLoanRequest
} from '@komgo/types'
import { injectable, inject } from 'inversify'

import { CONFIG } from '../../inversify/config'
import { TYPES } from '../../inversify/types'
import { ICompany } from '../clients/ICompany'
import { ICompanyClient } from '../clients/ICompanyClient'
import { PRODUCT_ID, SUB_PRODUCT_ID } from '../notifications/enums'
import { getEmailData, getCurrencyAndTenorInfo } from '../utils/utils'

import { CreditLineRequestTaskType } from './CreditLineRequestTaskType'
import { ITaskCreateData } from './ITaskCreateData'
import { TaskType } from './TaskType'

export interface ICreditLineRequestTaskFactory {
  getTaskContext(type: CreditLineRequestTaskType, data: ICreditLineRequest)
  getDepositLoanTaskContext(type: CreditLineRequestTaskType, data: IDepositLoanRequest)
  getTask(
    type: CreditLineRequestTaskType,
    data: ICreditLineRequest | IDepositLoanRequest,
    company: ICompany,
    creditLineCounterparty: ICompany,
    sharedCreditLine: ISharedCreditLine<IInformationShared> | ISharedDepositLoan
  ): Promise<ITaskCreateData>
}

@injectable()
export class CreditLineRequestTaskFactory implements ICreditLineRequestTaskFactory {
  private readonly strategies = new Map<
    CreditLineRequestTaskType,
    (
      type: CreditLineRequestTaskType,
      data: ICreditLineRequest | IDepositLoanRequest,
      company?: ICompany,
      creditLineCounterparty?: ICompany,
      shared?: ISharedCreditLine<IInformationShared> | ISharedDepositLoan
    ) => Promise<ITaskCreateData>
  >()

  constructor(
    @inject(TYPES.CompanyClient) private readonly companyClient: ICompanyClient,
    @inject(CONFIG.KapsuleUrl) protected readonly kapsuleBaseUrl: string
  ) {
    this.setupStrategies()
  }

  getTaskContext(type: CreditLineRequestTaskType, data: ICreditLineRequest): any {
    return {
      ...data.context,
      type,
      staticId: data.staticId,
      counterpartyStaticId: data.counterpartyStaticId,
      companyStaticId: data.companyStaticId
    }
  }

  getDepositLoanTaskContext(type: CreditLineRequestTaskType, data: IDepositLoanRequest): any {
    return {
      staticId: data.staticId,
      type: data.type,
      currency: data.currency,
      period: data.period,
      periodDuration: data.periodDuration
    }
  }

  getTask(
    type: CreditLineRequestTaskType,
    data: ICreditLineRequest | IDepositLoanRequest,
    company: ICompany,
    creditLineCounterparty: ICompany,
    shared: ISharedCreditLine<IInformationShared> | ISharedDepositLoan
  ): Promise<ITaskCreateData> {
    return this.strategies.get(type)(type, data, company, creditLineCounterparty, shared)
  }

  private setupStrategies(): any {
    this.strategies.set(CreditLineRequestTaskType.ReviewCLR, this.getReviewCreditLineRequest.bind(this))
    this.strategies.set(CreditLineRequestTaskType.ReviewDLR, this.getReviewDepositLoanRequest.bind(this))
  }

  private async getReviewCreditLineRequest(
    type: CreditLineRequestTaskType,
    data: ICreditLineRequest,
    creditLineCompany?: ICompany,
    creditLineCounterparty?: ICompany,
    sharedCreditLine?: ISharedCreditLine<IInformationShared>
  ): Promise<ITaskCreateData> {
    const taskData = {
      ...this.buildCommonTaskData(type, data),
      context: this.getTaskContext(type, data)
    }
    const taskInfo = this.buildCreditLineTaskInfo(data.context)

    const requester = creditLineCompany || (await this.companyClient.getCompanyByStaticId(data.companyStaticId))
    creditLineCounterparty =
      creditLineCounterparty || (await this.companyClient.getCompanyByStaticId(data.counterpartyStaticId))

    const action = sharedCreditLine ? 'updated' : 'disclosed'

    const task = {
      summary: `Review request for ${taskInfo.title} information from ${requester.x500Name.CN} on ${creditLineCounterparty.x500Name.CN}`,
      requiredPermission: taskInfo.requiredPermission,
      ...taskData,
      emailData: getEmailData(taskInfo.type, `${this.kapsuleBaseUrl}/tasks`)
    }

    return {
      task,
      notification: {
        message: `${requester.x500Name.CN} has asked for ${taskInfo.title} information to be ${action} on ${creditLineCounterparty.x500Name.CN}`
      }
    }
  }

  private async getReviewDepositLoanRequest(
    type: CreditLineRequestTaskType,
    data: IDepositLoanRequest,
    creditLineCompany?: ICompany,
    creditLineCounterparty?: ICompany,
    sharedCreditLine?: ISharedDepositLoan
  ): Promise<ITaskCreateData> {
    const taskData = {
      ...this.buildCommonTaskData(type, data),
      context: this.getDepositLoanTaskContext(type, data)
    }
    const taskInfo = this.buildDepositLoanTaskInfo(data.type)

    const requester = creditLineCompany || (await this.companyClient.getCompanyByStaticId(data.companyStaticId))
    const action = sharedCreditLine ? 'updated' : 'disclosed'

    const task = {
      summary: `${
        requester.x500Name.CN
      } has asked for ${data.type.toLowerCase()} information to be ${action} on ${getCurrencyAndTenorInfo(data)}`,
      requiredPermission: taskInfo.requiredPermission,
      ...taskData,
      emailData: getEmailData(taskInfo.type, `${this.kapsuleBaseUrl}/tasks`)
    }

    return {
      task,
      notification: {
        message: `${
          requester.x500Name.CN
        } has asked for ${data.type.toLowerCase()} information to be ${action} on ${getCurrencyAndTenorInfo(data)}`
      }
    }
  }

  private buildCommonTaskData(type: CreditLineRequestTaskType, data: ICreditLineRequest | IDepositLoanRequest) {
    return {
      taskType: type,
      status: TaskStatus.ToDo,
      counterpartyStaticId: data.companyStaticId
    }
  }

  private buildDepositLoanTaskInfo(type: DepositLoanType) {
    if (type === DepositLoanType.Deposit) {
      return {
        requiredPermission: {
          productId: PRODUCT_ID.TradeFinance,
          actionId: tradeFinanceManager.canCrudDeposit.action
        },
        type: TaskType.Deposit
      }
    }
    if (type === DepositLoanType.Loan) {
      return {
        requiredPermission: {
          productId: PRODUCT_ID.TradeFinance,
          actionId: tradeFinanceManager.canCrudLoan.action
        },
        type: TaskType.Loan
      }
    }

    return {}
  }

  private buildCreditLineTaskInfo(context: IProductContext) {
    if (context.productId !== PRODUCT_ID.TradeFinance) {
      return {}
    }
    switch (context.subProductId) {
      case SUB_PRODUCT_ID.RiskCover:
        return {
          requiredPermission: {
            productId: PRODUCT_ID.TradeFinance,
            actionId: tradeFinanceManager.canCrudRiskCover.action
          },
          title: 'risk cover',
          type: TaskType.RiskCover
        }
      case SUB_PRODUCT_ID.BankLine:
        return {
          requiredPermission: {
            productId: PRODUCT_ID.TradeFinance,
            actionId: tradeFinanceManager.canCrudBankLine.action
          },
          title: 'bank line',
          type: TaskType.BankLines
        }
      default:
        return {}
    }
  }
}
