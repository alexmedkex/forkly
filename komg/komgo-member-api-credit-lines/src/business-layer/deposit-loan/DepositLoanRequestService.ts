import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { TaskManager, TaskStatus } from '@komgo/notification-publisher'
import {
  DepositLoanType,
  Currency,
  DepositLoanPeriod,
  ISharedDepositLoan,
  DepositLoanRequestStatus,
  DepositLoanRequestType,
  ISaveDepositLoanRequest,
  IDepositLoanRequest
} from '@komgo/types'
import { injectable, inject } from 'inversify'
import * as _ from 'lodash'

import { ICompany } from '../../business-layer/clients/ICompany'
import { IDepositLoanDataAgent } from '../../data-layer/data-agents/IDepositLoanDataAgent'
import { IDepositLoanRequestDataAgent } from '../../data-layer/data-agents/IDepositLoanRequestDataAgent'
import { ISharedDepositLoanDataAgent } from '../../data-layer/data-agents/ISharedDepositLoanDataAgent'
import { IDepositLoanRequestDocument } from '../../data-layer/models/IDepositLoanRequestDocument'
import { CONFIG } from '../../inversify/config'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/Constants'
import { getCompanyDisplayName } from '../../utils/utils'
import { CompanyClient } from '../clients/CompanyClient'
import { processServiceError } from '../clients/utils'
import { ICreditLineValidationService } from '../CreditLineValidationService'
import { getDepositLoanFeatureType } from '../enums/feature'
import { ValidationError } from '../errors/ValidationError'
import { IDepositLoanRequestMessage, IDepositLoanRequestPayload } from '../messaging/messages/IDepositLoanMessage'
import { MessageType } from '../messaging/MessageTypes'
import { RequestClient } from '../messaging/RequestClient'
import { DepositLoanNotificationFactory } from '../notifications/DepositLoanNotificationFactory'
import { NotificationOperation } from '../notifications/NotificationOperation'
import { NotificationClient } from '../notifications/notifications/NotificationClient'
import { ICreditLineRequestTaskFactory } from '../tasks/CreditLineRequestTaskFactory'
import { CreditLineRequestTaskType } from '../tasks/CreditLineRequestTaskType'

export interface IDepositLoanRequestService {
  create(type: DepositLoanType, request: ISaveDepositLoanRequest): Promise<string[]>
  closeAllPendingRequests(
    type: DepositLoanType,
    currency?: Currency,
    period?: DepositLoanPeriod,
    periodDuration?: number
  )
  closeAllPendingRequestsByRequestIds(type: DepositLoanType, requestIds: string[])
  requestReceived(request: IDepositLoanRequest): Promise<boolean>
  requestDeclined(request: IDepositLoanRequest): Promise<boolean>
  getPendingRequest(
    type: DepositLoanType,
    companyStaticId: string,
    currency: Currency,
    period: DepositLoanPeriod,
    periodDuration?: number
  ): Promise<IDepositLoanRequest>
  markCompleted(request: IDepositLoanRequest, status?: DepositLoanRequestStatus): Promise<boolean>
}

@injectable()
export class DepositLoanRequestService implements IDepositLoanRequestService {
  private readonly logger = getLogger('DepositLoanRequestService')

  constructor(
    @inject(TYPES.DepositLoanRequestDataAgent)
    private readonly depositLoanRequestDataAgent: IDepositLoanRequestDataAgent,
    @inject(TYPES.TaskManagerClient) private readonly taskManager: TaskManager,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient,
    @inject(TYPES.CompanyClient) private readonly companyClient: CompanyClient,
    @inject(CONFIG.CompanyStaticId) private readonly companyStaticId: string,
    @inject(TYPES.DepositLoanNotificationFactory)
    private readonly depositLoanNotificationFactory: DepositLoanNotificationFactory,
    @inject(TYPES.RequestClient) private readonly requestClient: RequestClient,
    @inject(TYPES.CreditLineValidationService) private readonly validationService: ICreditLineValidationService,
    @inject(TYPES.DepositLoanDataAgent) private readonly depositLoanDataAgent: IDepositLoanDataAgent,
    @inject(TYPES.SharedDepositLoanDataAgent) private readonly sharedDepositLoanDataAgent: ISharedDepositLoanDataAgent,
    @inject(TYPES.CreditLineRequestTaskFactory)
    private readonly creditLineRequestTaskFactory: ICreditLineRequestTaskFactory
  ) {}

  async create(type: DepositLoanType, request: ISaveDepositLoanRequest): Promise<string[]> {
    // do not validate this for now as we don not have pending requests displayed on UI
    // await this.validatePendingRequests(request)

    this.logger.info(`Creating ${type} requests`)
    const { companyIds, ...options } = request

    try {
      const depositLoanRequests: string[] = await Promise.all(
        companyIds.map(async companyId => {
          return this.depositLoanRequestDataAgent.create({
            requestType: DepositLoanRequestType.Requested,
            status: DepositLoanRequestStatus.Pending,
            ...options,
            companyStaticId: companyId,
            staticId: undefined,
            createdAt: undefined,
            updatedAt: undefined
          })
        })
      )

      await this.sendDepositLoanRequestMessage(type, request)

      return depositLoanRequests
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.DepositLoanRequestInvalidData, {
        currency: request.currency,
        period: request.period,
        periodDuration: request.periodDuration,
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  async getPendingRequest(
    type: DepositLoanType,
    companyStaticId: string,
    currency: Currency,
    period: DepositLoanPeriod,
    periodDuration?: number
  ): Promise<IDepositLoanRequest> {
    const requests = await this.depositLoanRequestDataAgent.findForCompaniesAndType(
      type,
      companyStaticId,
      currency,
      period,
      periodDuration,
      {
        requestType: DepositLoanRequestType.Received,
        status: DepositLoanRequestStatus.Pending
      }
    )

    return requests && requests.length ? this.getDepositLoanDocumentRequest(requests[0]) : null
  }

  async markCompleted(request: IDepositLoanRequest, status = DepositLoanRequestStatus.Disclosed): Promise<boolean> {
    this.logger.info('Marking request as completed', {
      companyStaticId: request.companyStaticId,
      status
    })

    request.status = status
    await this.depositLoanRequestDataAgent.update(this.getDepositLoanRequestDocument(request))
    await this.completeRequestTask(request, status === DepositLoanRequestStatus.Disclosed)

    return true
  }

  async requestReceived(request: IDepositLoanRequest): Promise<boolean> {
    this.logger.info(`Request for ${request.type} received`, {
      companyStaticId: request.companyStaticId,
      type: request.type,
      currency: request.currency,
      period: request.period,
      periodDuration: request.periodDuration
    })

    const companyRequesting = await this.validationService.validateNonFinanceInstitution(request.companyStaticId)

    const existingRequest = await this.getPendingRequest(
      request.type,
      request.companyStaticId,
      request.currency,
      request.period,
      request.periodDuration
    )

    if (existingRequest) {
      this.logger.info('Request exists, updating')

      existingRequest.comment = request.comment

      await this.depositLoanRequestDataAgent.update(this.getDepositLoanRequestDocument(existingRequest))
    } else {
      const staticId = await this.depositLoanRequestDataAgent.create({
        ...request,
        createdAt: undefined,
        updatedAt: undefined
      })

      request.staticId = staticId

      const existingSharedDepositLoan = await this.getExistingSharedDepositLoanForRequest(request)

      await this.createTask(CreditLineRequestTaskType.ReviewDLR, request, companyRequesting, existingSharedDepositLoan)
    }

    return true
  }

  async requestDeclined(declineRequest: IDepositLoanRequest): Promise<boolean> {
    const requests = await this.depositLoanRequestDataAgent.findForCompaniesAndType(
      declineRequest.type,
      declineRequest.companyStaticId,
      declineRequest.currency,
      declineRequest.period,
      declineRequest.periodDuration,
      {
        requestType: DepositLoanRequestType.Requested,
        status: DepositLoanRequestStatus.Pending
      }
    )

    if (!requests.length) {
      this.logger.warn(
        ErrorCode.DatabaseInvalidData,
        ErrorName.CreditLineRequestInvalidData,
        'No pending requests to decline',
        {
          companyStaticId: declineRequest.companyStaticId,
          currency: declineRequest.currency,
          period: declineRequest.period,
          periodDuration: declineRequest.periodDuration
        }
      )

      return
    }

    const request = requests[0]
    request.status = DepositLoanRequestStatus.Declined
    const depositLoanRequest = await this.depositLoanRequestDataAgent.update(request)

    const companies = await this.companyClient.getCompanies({
      staticId: { $in: [this.companyStaticId, declineRequest.companyStaticId] }
    })

    const company = companies.find(c => c.staticId === declineRequest.companyStaticId)

    await this.notificationClient.sendNotification(
      this.depositLoanNotificationFactory.getNotification(
        NotificationOperation.DeclineRequest,
        depositLoanRequest,
        getCompanyDisplayName(company)
      )
    )
  }

  async closeAllPendingRequests(
    type: DepositLoanType,
    currency: Currency,
    period: DepositLoanPeriod,
    periodDuration?: number
  ): Promise<string[]> {
    this.logger.info(`Closing all new pending requests that has not been added to ${type}`, {
      currency,
      period,
      periodDuration
    })

    const requests = await this.depositLoanRequestDataAgent.find({
      status: DepositLoanRequestStatus.Pending,
      currency,
      period,
      periodDuration
    })

    if (!requests.length) {
      this.logger.info('No pending requests to close')

      return []
    }

    await this.decline(requests)
  }

  async closeAllPendingRequestsByRequestIds(type: DepositLoanType, requestIds: string[]): Promise<string[]> {
    this.logger.info(`Closing all new pending requests that has not been added to ${type}`, {
      type,
      requestIds
    })

    const requests = await this.depositLoanRequestDataAgent.find({
      status: DepositLoanRequestStatus.Pending,
      staticId: { $in: requestIds }
    })

    if (!requests.length) {
      this.logger.info('No pending requests to close')

      return []
    }

    if (requestIds) {
      // check if passed requestsIds match open requests
      const openRequests = requests.map(r => r.staticId)

      const invalidRequestIds = requestIds.filter(id => !openRequests.includes(id))

      if (invalidRequestIds.length) {
        throw new ValidationError('Cant decline some requests', ErrorCode.DatabaseInvalidData, {
          requestIds: [`${invalidRequestIds.join(',')} can't be declined`]
        })
      }
    }

    await this.decline(requests)
  }

  private async decline(requests: IDepositLoanRequestDocument[]) {
    const declinedRequests = []

    await Promise.all(
      requests.map(async requestDoc => {
        declinedRequests.push(requestDoc.staticId)
        const request = this.getDepositLoanDocumentRequest(requestDoc)
        await this.markCompleted(this.getDepositLoanRequestDocument(request), DepositLoanRequestStatus.Declined)
        await this.requestClient.sendCommonRequest(
          MessageType.CreditLineRequestDeclined,
          request.companyStaticId,
          this.getDeclineMessage(request)
        )
      })
    )

    return declinedRequests
  }

  private getDeclineMessage(request: IDepositLoanRequest): IDepositLoanRequestMessage<IDepositLoanRequestPayload> {
    this.logger.info(`Create message for ${request.type} requests`)

    return {
      version: 1,
      messageType: MessageType.CreditLineRequestDeclined,
      companyStaticId: this.companyStaticId,
      recepientStaticId: request.companyStaticId,
      featureType: getDepositLoanFeatureType(request.type),
      payload: {
        comment: request.comment,
        currency: request.currency,
        period: request.period,
        periodDuration: request.periodDuration,
        type: request.type
      }
    }
  }

  private async createTask(
    taskType: CreditLineRequestTaskType,
    depositLoanRequestTask: IDepositLoanRequest,
    depositLoanCompany: ICompany,
    existingSharedDepositLoan: ISharedDepositLoan
  ) {
    this.logger.info('Creating task', { taskType, requestId: depositLoanRequestTask.staticId })
    const task = await this.creditLineRequestTaskFactory.getTask(
      taskType,
      depositLoanRequestTask,
      depositLoanCompany,
      null,
      existingSharedDepositLoan
    )

    try {
      await this.taskManager.createTask(task.task, task.notification.message)
    } catch (error) {
      processServiceError(error, 'Submit task', this.logger)
    }
  }

  private async completeRequestTask(request: IDepositLoanRequest, outcome: boolean): Promise<void> {
    const taskContext = await this.creditLineRequestTaskFactory.getDepositLoanTaskContext(
      CreditLineRequestTaskType.ReviewDLR,
      request
    )

    this.logger.info('Resolving task', { taskType: CreditLineRequestTaskType.ReviewCLR, requestId: request.staticId })

    try {
      await this.taskManager.updateTaskStatus({
        status: TaskStatus.Done,
        taskType: CreditLineRequestTaskType.ReviewDLR,
        context: taskContext,
        outcome
      })
    } catch (error) {
      processServiceError(error, 'Submit task', this.logger)
    }
  }

  private async sendDepositLoanRequestMessage(type: DepositLoanType, request: ISaveDepositLoanRequest) {
    this.logger.info(`Sending messages for ${type} requests`)
    const { companyIds } = request

    return Promise.all(
      companyIds.map(async companyId => {
        const message = this.getMessage(companyId, request, MessageType.CreditLineRequest)
        await this.requestClient.sendCommonRequest(MessageType.CreditLineRequest, companyId, message)
      })
    )
  }

  private getMessage(
    companyId: string,
    data: ISaveDepositLoanRequest,
    messageType: MessageType
  ): IDepositLoanRequestMessage<IDepositLoanRequestPayload> {
    this.logger.info(`Create message for ${data.type} requests`)
    return {
      version: 1,
      featureType: getDepositLoanFeatureType(data.type),
      companyStaticId: this.companyStaticId,
      recepientStaticId: companyId,
      messageType,
      payload: {
        comment: data.comment,
        currency: data.currency,
        period: data.period,
        periodDuration: data.periodDuration,
        type: data.type
      }
    }
  }

  private async getExistingSharedDepositLoanForRequest(request: IDepositLoanRequest) {
    const existingDepositLoan = await this.depositLoanDataAgent.findOne({
      type: request.type,
      currency: request.currency,
      periodDuration: request.periodDuration,
      period: request.period
    })

    if (!existingDepositLoan) {
      return null
    }

    const existingSharedDepositLoan = await this.sharedDepositLoanDataAgent.findOneByDepositLoanAndCompanies(
      existingDepositLoan.staticId,
      request.companyStaticId
    )

    // diff context for deposit or loan for specified shared deposit or loan
    if (!existingSharedDepositLoan) {
      return null
    }

    return existingSharedDepositLoan
  }

  private getDepositLoanDocumentRequest(request: IDepositLoanRequestDocument) {
    return { ...request, createdAt: undefined, updatedAt: undefined }
  }

  private getDepositLoanRequestDocument(request: IDepositLoanRequest) {
    return { ...request, createdAt: undefined, updatedAt: undefined }
  }
}
