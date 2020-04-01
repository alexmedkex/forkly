import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { TaskManager, TaskStatus } from '@komgo/notification-publisher'
import {
  ICreateCreditLineRequest,
  CreditLineRequestType,
  CreditLineRequestStatus,
  IProductContext,
  ICreditLineRequest,
  ISharedCreditLine,
  IInformationShared
} from '@komgo/types'
import { injectable, inject } from 'inversify'
import * as _ from 'lodash'

import { ICreditLineDataAgent } from '../data-layer/data-agents/ICreditLineDataAgent'
import { ICreditLineRequestDataAgent } from '../data-layer/data-agents/ICreditLineRequestDataAgent'
import { ISharedCreditLineDataAgent } from '../data-layer/data-agents/ISharedCreditLineDataAgent'
import { ICreditLineRequestDocument } from '../data-layer/models/ICreditLineRequestDocument'
import { CONFIG } from '../inversify/config'
import { TYPES } from '../inversify/types'
import { ErrorName } from '../utils/Constants'
import { getCompanyDisplayName } from '../utils/utils'

import { CompanyClient } from './clients/CompanyClient'
import { ICompany } from './clients/ICompany'
import { processServiceError } from './clients/utils'
import { CreditLineValidationFactory } from './CreditLineValidationFactory'
import { ICreditLineValidationService } from './CreditLineValidationService'
import { CreditLineValidationType } from './CreditLineValidationType'
import { getFeatureForProduct } from './enums/feature'
import { ValidationError } from './errors/ValidationError'
import { ICreditLineRequestMessage } from './messaging/messages/ICreditLineRequestMessage'
import { MessageType } from './messaging/MessageTypes'
import { RequestClient } from './messaging/RequestClient'
import { NotificationFactory } from './notifications'
import { NotificationOperation } from './notifications/NotificationOperation'
import { NotificationClient } from './notifications/notifications/NotificationClient'
import { ICreditLineRequestTaskFactory } from './tasks/CreditLineRequestTaskFactory'
import { CreditLineRequestTaskType } from './tasks/CreditLineRequestTaskType'
import { getNotificationType } from './utils/utils'

export interface ICreditLineRequestService {
  create(request: ICreateCreditLineRequest): Promise<string[]>
  getPendingRequest(
    companyStaticId: string,
    counterpartyStaticId: string,
    context: IProductContext
  ): Promise<ICreditLineRequest>
  requestReceived(request: ICreditLineRequest): Promise<boolean>
  closePendingSentRequest(
    companyStaticId: string,
    counterpartyStaticId: string,
    context: IProductContext,
    disclosed: boolean
  )
  requestDeclined(
    counterpartyStaticId: string,
    companyStaticId: string,
    context: IProductContext,
    requestStaticId: string
  ): Promise<boolean>
  markCompleted(request: ICreditLineRequest, status?: CreditLineRequestStatus): Promise<boolean>
  closeAllPendingRequests(
    counterpartyStaticId: string,
    context: IProductContext,
    requestIds?: string[]
  ): Promise<string[]>
}

@injectable()
export class CreditLineRequestService implements ICreditLineRequestService {
  private readonly logger = getLogger('CreditLineRequestService')

  constructor(
    @inject(TYPES.CreditLineRequestDataAgent) private readonly creditLineRequestDataAgent: ICreditLineRequestDataAgent,
    @inject(TYPES.SharedCreditLineDataAgent) private readonly sharedCreditLineDataAgent: ISharedCreditLineDataAgent,
    @inject(TYPES.CreditLineDataAgent) private readonly creditLineDataAgent: ICreditLineDataAgent,
    @inject(TYPES.RequestClient) private readonly requestClient: RequestClient,
    @inject(TYPES.CreditLineValidationService) private readonly validationService: ICreditLineValidationService,
    @inject(TYPES.CreditLineRequestTaskFactory)
    private readonly creditLineRequestTaskFactory: ICreditLineRequestTaskFactory,
    @inject(TYPES.TaskManagerClient) private readonly taskManager: TaskManager,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient,
    @inject(TYPES.CompanyClient) private readonly companyClient: CompanyClient,
    @inject(CONFIG.CompanyStaticId) private readonly companyStaticId: string,
    @inject(TYPES.NotificationFactory) private readonly notificationFactory: NotificationFactory
  ) {}

  async create(request: ICreateCreditLineRequest): Promise<string[]> {
    // do not validate this for now as we don not have pending requests displayed on UI
    // await this.validatePendingRequests(request)

    this.logger.info('Creating credit line requests')
    const { companyIds, ...options } = request

    try {
      const creditLineRequests: string[] = await Promise.all(
        companyIds.map(async companyId => {
          return this.creditLineRequestDataAgent.create({
            requestType: CreditLineRequestType.Requested,
            status: CreditLineRequestStatus.Pending,
            ...options,
            companyStaticId: companyId,
            staticId: undefined,
            createdAt: undefined,
            updatedAt: undefined
          })
        })
      )

      await this.sendCreditLineRequestMessage(request)

      return creditLineRequests
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.CreditLineRequestInvalidData, {
        counterpartyStaticId: request.counterpartyStaticId,
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  async getPendingRequest(
    companyStaticId: string,
    counterpartyStaticId: string,
    context: IProductContext
  ): Promise<ICreditLineRequest> {
    const requests = await this.creditLineRequestDataAgent.findForCompaniesAndContext(
      context,
      companyStaticId,
      counterpartyStaticId,
      {
        requestType: CreditLineRequestType.Received,
        status: CreditLineRequestStatus.Pending
      }
    )

    return requests && requests.length ? this.getCreditLineRequest(requests[0]) : null
  }

  async requestReceived(request: ICreditLineRequest): Promise<boolean> {
    this.logger.info('Request for credit line received', {
      companyStaticId: request.companyStaticId,
      counterpartyStaticId: request.counterpartyStaticId,
      context: request.context
    })

    const type = CreditLineValidationFactory.ValidationType(request.context)

    const creditLineCounterparty: ICompany = await this.validationService.validateCreditLineCounterparty(
      request.counterpartyStaticId,
      type === CreditLineValidationType.ValidateRiskCover ? false : true
    )

    const companyRequesting = await this.validationService.validateNonFinanceInstitution(request.companyStaticId)

    const existingRequest = await this.getPendingRequest(
      request.companyStaticId,
      request.counterpartyStaticId,
      request.context
    )

    if (existingRequest) {
      this.logger.info('Request exists, updating')

      existingRequest.comment = request.comment

      await this.creditLineRequestDataAgent.update(this.getCreditLineRequestDocument(existingRequest))
    } else {
      const staticId = await this.creditLineRequestDataAgent.create({
        ...request,
        createdAt: undefined,
        updatedAt: undefined
      })

      request.staticId = staticId

      const existingSharedCreditLine = await this.getExistingSharedCreditLineForRequest(request)

      await this.createTask(
        CreditLineRequestTaskType.ReviewCLR,
        request,
        companyRequesting,
        creditLineCounterparty,
        existingSharedCreditLine
      )
    }

    return true
  }

  async requestDeclined(
    counterpartyStaticId: string,
    companyStaticId: string,
    context: IProductContext,
    requestStaticId: string
  ): Promise<boolean> {
    const requests = await this.creditLineRequestDataAgent.findForCompaniesAndContext(
      context,
      companyStaticId,
      counterpartyStaticId,
      {
        requestType: CreditLineRequestType.Requested,
        status: CreditLineRequestStatus.Pending
      }
    )

    if (!requests.length) {
      this.logger.warn(
        ErrorCode.DatabaseInvalidData,
        ErrorName.CreditLineRequestInvalidData,
        'No pending requests to decline',
        {
          context,
          companyStaticId,
          counterpartyStaticId
        }
      )

      return
    }

    const request = requests[0]
    request.status = CreditLineRequestStatus.Declined
    await this.creditLineRequestDataAgent.update(request)

    const companies = await this.companyClient.getCompanies({
      staticId: { $in: [companyStaticId, counterpartyStaticId] }
    })

    const company = companies.find(c => c.staticId === companyStaticId)
    const counterparty = companies.find(c => c.staticId === counterpartyStaticId)

    await this.notificationClient.sendNotification(
      this.notificationFactory.getNotification(
        getNotificationType(context, NotificationOperation.DeclineRequest),
        this.getCreditLineRequest(request),
        getCompanyDisplayName(company),
        getCompanyDisplayName(counterparty)
      )
    )
  }

  async closePendingSentRequest(
    companyStaticId: string,
    counterpartyStaticId: string,
    context: IProductContext,
    disclosed: boolean
  ) {
    this.logger.info('Closing sent requests', {
      companyStaticId,
      counterpartyStaticId,
      context
    })

    const requests = await this.creditLineRequestDataAgent.findForCompaniesAndContext(
      context,
      companyStaticId,
      counterpartyStaticId,
      {
        requestType: CreditLineRequestType.Requested,
        status: CreditLineRequestStatus.Pending
      }
    )

    if (!requests.length) {
      this.logger.info('No open requests found')

      return
    }

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i]
      request.status = disclosed ? CreditLineRequestStatus.Disclosed : CreditLineRequestStatus.Declined
      await this.creditLineRequestDataAgent.update(request)
    }
  }

  async markCompleted(request: ICreditLineRequest, status = CreditLineRequestStatus.Disclosed): Promise<boolean> {
    this.logger.info('Marking request as completed', {
      companyStaticId: request.companyStaticId,
      counterpartyStaticId: request.counterpartyStaticId,
      context: request.context,
      status
    })

    request.status = status
    await this.creditLineRequestDataAgent.update(this.getCreditLineRequestDocument(request))
    await this.completeRequestTask(request, status === CreditLineRequestStatus.Disclosed)

    return true
  }

  async closeAllPendingRequests(
    counterpartyStaticId: string,
    context: IProductContext,
    requestIds: string[]
  ): Promise<string[]> {
    this.logger.info('Closing all new pending requests that has not been added to credit line', {
      counterpartyStaticId,
      context
    })

    const requests = await this.creditLineRequestDataAgent.findForCompaniesAndContext(
      context,
      null,
      counterpartyStaticId,
      { status: CreditLineRequestStatus.Pending }
    )

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

    const declinedRequests = []

    await Promise.all(
      requests.map(async requestDoc => {
        declinedRequests.push(requestDoc.staticId)
        const request = this.getCreditLineRequest(requestDoc)
        await this.markCompleted(this.getCreditLineRequest(request), CreditLineRequestStatus.Declined)
        await this.requestClient.sendCommonRequest(
          MessageType.CreditLineRequestDeclined,
          request.companyStaticId,
          this.getDeclineMessage(request)
        )
      })
    )

    return declinedRequests
  }

  private async completeRequestTask(request: ICreditLineRequest, outcome: boolean): Promise<void> {
    const taskContext = await this.creditLineRequestTaskFactory.getTaskContext(
      CreditLineRequestTaskType.ReviewCLR,
      request
    )

    this.logger.info('Resolving task', { taskType: CreditLineRequestTaskType.ReviewCLR, requestId: request.staticId })

    try {
      await this.taskManager.updateTaskStatus({
        status: TaskStatus.Done,
        taskType: CreditLineRequestTaskType.ReviewCLR,
        context: taskContext,
        outcome
      })
    } catch (error) {
      processServiceError(error, 'Submit task', this.logger)
    }
  }

  private async createTask(
    taskType: CreditLineRequestTaskType,
    creditLineRequestTask: ICreditLineRequest,
    creditLineCompany: ICompany,
    creditLineCounterparty: ICompany,
    existingSharedCreditLine: ISharedCreditLine<IInformationShared>
  ) {
    this.logger.info('Creating task', { taskType, requestId: creditLineRequestTask.staticId })

    const task = await this.creditLineRequestTaskFactory.getTask(
      taskType,
      creditLineRequestTask,
      creditLineCompany,
      creditLineCounterparty,
      existingSharedCreditLine
    )

    try {
      await this.taskManager.createTask(task.task, task.notification.message)
    } catch (error) {
      processServiceError(error, 'Submit task', this.logger)
    }
  }

  private async sendCreditLineRequestMessage(request: ICreateCreditLineRequest) {
    this.logger.info('Sending messages for credit line requests')
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
    data: ICreateCreditLineRequest,
    messageType: MessageType
  ): ICreditLineRequestMessage {
    this.logger.info('Create message for credit line requests')

    return {
      version: 1,
      context: data.context,
      messageType,
      companyStaticId: this.companyStaticId,
      counterpartyStaticId: data.counterpartyStaticId,
      recepientStaticId: companyId,
      comment: data.comment,
      featureType: getFeatureForProduct(data.context.productId, data.context.subProductId)
    }
  }

  private getDeclineMessage(request: ICreditLineRequest): ICreditLineRequestMessage {
    this.logger.info('Create message for credit line requests')

    return {
      version: 1,
      context: request.context,
      messageType: MessageType.CreditLineRequestDeclined,
      companyStaticId: this.companyStaticId,
      counterpartyStaticId: request.counterpartyStaticId,
      recepientStaticId: request.companyStaticId,
      featureType: getFeatureForProduct(request.context.productId, request.context.subProductId)
    }
  }

  private async getExistingSharedCreditLineForRequest(request: ICreditLineRequest) {
    const existingSharedCreditLine = await this.sharedCreditLineDataAgent.findOneByCreditLineAndCompanies(
      request.companyStaticId,
      request.counterpartyStaticId
    )

    if (!existingSharedCreditLine) {
      return null
    }

    const creditLine = await this.creditLineDataAgent.get(existingSharedCreditLine.creditLineStaticId)

    // diff context for credit line for specified shared credit line
    if (
      creditLine.context.productId !== request.context.productId ||
      creditLine.context.subProductId !== request.context.subProductId
    ) {
      return null
    }

    return existingSharedCreditLine
  }

  private async validatePendingRequests(request: ICreateCreditLineRequest) {
    const requests = await this.creditLineRequestDataAgent.find({
      counterpartyStaticId: request.counterpartyStaticId,
      companyStaticId: { $in: request.companyIds },
      requestType: CreditLineRequestType.Requested,
      status: CreditLineRequestStatus.Pending
    })

    if (requests && requests.length > 0) {
      // throw validation error
      const failedCompanyIds = requests.map(x => x.companyStaticId)
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.CreditLineRequestInvalidData,
        `Credit line request for company already exists: ${failedCompanyIds.join(',')}`
      )
      throw new ValidationError('Credit line request for company already exists.', ErrorCode.DatabaseInvalidData, {
        companyIds: [`Credit line request for companies already exists: ${failedCompanyIds.join(',')} `]
      })
    }
  }

  private getCreditLineRequest(request: ICreditLineRequestDocument) {
    return { ...request, createdAt: undefined, updatedAt: undefined }
  }

  private getCreditLineRequestDocument(request: ICreditLineRequest) {
    return { ...request, createdAt: undefined, updatedAt: undefined }
  }
}
