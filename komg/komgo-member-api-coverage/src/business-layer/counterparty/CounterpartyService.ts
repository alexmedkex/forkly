import { injectable, inject } from 'inversify'
import { TYPES } from '../../inversify/types'
import { getLogger } from '@komgo/logging'
import { ICounterpartyService } from './ICounterpartyService'
import { ICompanyClient } from '../registry/ICompanyClient'
import { ICompanyCoverageDataAgent } from '../../data-layer/data-agents/ICompanyCoverageDataAgent'
import { ICounterparty, ICounterpartyRequest } from '../../service-layer/responses/ICounterparty'
import { ICoverageCompany } from '../registry/ICompany'
import { STATUSES } from '../../data-layer/constants/Status'
import { RequestClient } from '../messaging/RequestClient'
import CounterpartyRequestMessage from '../messaging/messages/CounterpartyRequestMessage'
import {
  getCounterpartyReqReceived,
  getCounterpartyReqRejected,
  getCounterpartyReqApproved,
  getTaskStatusUpdateRequest,
  getCounterpartyAutoAdd
} from '../notifications/notification-objects/notificationBuilder'
import { TaskManager, NotificationManager, TaskStatus } from '@komgo/notification-publisher'
import { ICompanyCoverageDocument } from '../../data-layer/models/ICompanyCoverageDocument'
import { MessageType, MESSAGE_TYPE } from '../messaging/MessageTypes'
import { COUNTERPARTY_ACTIONS } from './Constants'
import { CounterpartyError } from '../errors/CounterpartyError'
import { COUNTERPARTY_ERROR_CODE } from '../errors/CounterpartyErrorCode'
import * as _ from 'lodash'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'
import { MetricState, MetricAction, Metric } from '../../utils/Metrics'
import { ICounterpartyProfileDataAgent } from '../../data-layer/data-agents/ICounterpartyProfileDataAgent'
import { RiskLevel } from '../../data-layer/models/profile/enums'

@injectable()
export default class CounterpartyService implements ICounterpartyService {
  private readonly logger = getLogger('Counterparty')

  constructor(
    @inject(TYPES.CompanyClient) private readonly companyClient: ICompanyClient,
    @inject(TYPES.CompanyCoverageDataAgent) private readonly companyCoverageDataAgent: ICompanyCoverageDataAgent,
    @inject(TYPES.CounterpartyProfileDataAgent)
    private readonly counterpartyProfileDataAgent: ICounterpartyProfileDataAgent,
    @inject(TYPES.RequestClient) private readonly requestClient: RequestClient,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationManager,
    @inject(TYPES.TaskManagerClient) private readonly taskManagerClient: TaskManager,
    @inject('company-static-id') private readonly companyStaticId: string
  ) {}

  async getCounterpartyRequest(requestId: string): Promise<ICounterpartyRequest> {
    const counterPartyRequest = await this.companyCoverageDataAgent.findOne({
      coverageRequestId: requestId
    })

    if (!counterPartyRequest) {
      // Request not found
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CounterpartyRequestNotFound, {
        action: COUNTERPARTY_ACTIONS.GET_REQUEST,
        requestId
      })

      throw new CounterpartyError(COUNTERPARTY_ERROR_CODE.REQUEST_NOT_FOUND, `Request with id: ${requestId} not found`)
    }

    const company = await this.companyClient.getCompanyByStaticId(counterPartyRequest.companyId)

    return {
      ...this.mapToCounterparty(counterPartyRequest, company),
      requestId: counterPartyRequest.coverageRequestId
    }
  }

  async getCounterparties(query: any): Promise<ICounterparty[]> {
    const companies = await this.companyClient.getCompanies(query)
    if (!companies || companies.length <= 0) {
      return []
    }
    const counterparties = await this.retriveCompanies(companies, {
      covered: true,
      status: STATUSES.COMPLETED
    })
    return this.mapCounterpartiesData(companies, counterparties)
  }

  async getConnectedCounterpartiesWithRequests(query: any): Promise<ICounterparty[]> {
    const companies = await this.companyClient.getCompanies(query)
    if (!companies || companies.length <= 0) {
      return []
    }
    const counterparties = await this.retriveCompanies(companies, {
      $or: [
        {
          covered: false,
          status: { $in: [STATUSES.PENDING, STATUSES.WAITING] }
        },
        {
          covered: true,
          status: STATUSES.COMPLETED
        }
      ]
    })
    return this.mapCounterpartiesData(companies, counterparties)
  }

  async getCompanies(query: any): Promise<ICoverageCompany[]> {
    const companies = await this.companyClient.getCompanies(query)

    if (!companies || !companies.length) {
      return []
    }

    return this.resolveNotCoveredCompanies(companies)
  }

  async resolveNotCoveredCompanies(companies: ICoverageCompany[]): Promise<ICoverageCompany[]> {
    const companyIds = companies.map(x => x.staticId)
    const existingCounterparties = await this.companyCoverageDataAgent.findByCompanyIds(companyIds)

    const notCovered = companies.filter(
      x =>
        this.companyStaticId !== x.staticId &&
        !existingCounterparties.some(y => y.companyId === x.staticId && y.covered && y.status === STATUSES.COMPLETED)
    )

    // append status from not completed request
    return notCovered.map(company => {
      const relatedCounterpartyRequest = existingCounterparties.find(
        x => x.companyId === company.staticId && !x.covered && x.status !== STATUSES.COMPLETED
      )

      return {
        ...company,
        status: relatedCounterpartyRequest ? relatedCounterpartyRequest.status : undefined
      }
    })
  }

  async autoAddCountepartyList(companyIds: string[]): Promise<void> {
    companyIds.forEach(async companyId => {
      await this.autoAddCounteparty(companyId)
    })
  }

  async autoAddCounteparty(companyId: string): Promise<void> {
    if (this.companyStaticId === companyId) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartySelfAddFailed, {
        action: COUNTERPARTY_ACTIONS.AUTO_ADD,
        companyId
      })
      return
    }

    const company = await this.companyClient.getCompanyByStaticId(companyId)
    if (!company) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CompanyNotFound, {
        action: COUNTERPARTY_ACTIONS.AUTO_ADD,
        companyId,
        memberCompanyId: this.companyStaticId
      })

      return
    }

    let counterparty = await this.companyCoverageDataAgent.findOne({
      companyId,
      covered: true,
      status: STATUSES.COMPLETED
    })

    if (counterparty) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyAlreadyAdded, {
        action: COUNTERPARTY_ACTIONS.AUTO_ADD,
        companyId,
        memberCompanyId: this.companyStaticId
      })

      return
    }

    // check if exists... pending request or waiting request...
    counterparty = await this.companyCoverageDataAgent.findOne({
      companyId,
      covered: false,
      status: { $ne: STATUSES.COMPLETED }
    })

    if (counterparty) {
      this.logger.warn(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyAlreadyPending, {
        action: COUNTERPARTY_ACTIONS.AUTO_ADD,
        companyId,
        memberCompanyId: this.companyStaticId
      })
      counterparty.covered = true
      counterparty.status = STATUSES.COMPLETED
      counterparty.coverageAutoAddedOn = new Date(Date.now())
      await this.companyCoverageDataAgent.update(counterparty.coverageRequestId, counterparty)
      this.logger.info(`Auto added successful`, {
        action: COUNTERPARTY_ACTIONS.AUTO_ADD,
        companyId,
        memberCompanyId: this.companyStaticId
      })
      this.logger.metric({
        [Metric.Action]: [MetricAction.CounterpartyAutomaticallyAdded],
        [Metric.State]: [MetricState.Success]
      })
      await this.notificationClient.createNotification(getCounterpartyAutoAdd(company.staticId, company.x500Name.CN))
      return
    }

    await this.companyCoverageDataAgent.create({
      companyId,
      covered: true,
      status: STATUSES.COMPLETED,
      coverageAutoAddedOn: new Date()
    })
    this.logger.info(`Auto added successful`, {
      action: COUNTERPARTY_ACTIONS.AUTO_ADD,
      companyId,
      memberCompanyId: this.companyStaticId
    })
    this.logger.metric({
      [Metric.Action]: [MetricAction.CounterpartyAutomaticallyAdded],
      [Metric.State]: [MetricState.Success]
    })

    // Create the empty profile of the new counterparty
    await this.createEmptyCounterpartyProfile(companyId)
    await this.notificationClient.createNotification(getCounterpartyAutoAdd(company.staticId, company.x500Name.CN))
    return
  }

  async addCounterparty(companyId: string): Promise<void> {
    const company = await this.companyClient.getCompanyByStaticId(companyId)

    if (!company) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CompanyNotFound, {
        action: COUNTERPARTY_ACTIONS.ADD,
        companyId
      })

      throw new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST, `Company id ${companyId} not found`)
    }

    let counterparty = await this.companyCoverageDataAgent.findOne({
      companyId,
      covered: true,
      status: STATUSES.COMPLETED
    })

    if (counterparty) {
      // counterparty already added
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyAlreadyAdded, {
        action: COUNTERPARTY_ACTIONS.ADD,
        companyId,
        memberCompanyId: this.companyStaticId
      })

      throw new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST, `Company already added as counterparty`)
    }

    counterparty = await this.companyCoverageDataAgent.findOne({
      companyId,
      covered: false,
      status: { $ne: STATUSES.COMPLETED }
    })

    // skip if pending
    if (counterparty) {
      this.logger.warn(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyAlreadyExist, {
        action: COUNTERPARTY_ACTIONS.ADD,
        companyId,
        memberCompanyId: this.companyStaticId
      })

      throw new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST, `Request for company already sent`)
    }

    const entity = await this.companyCoverageDataAgent.create({
      companyId,
      covered: false,
      status: STATUSES.PENDING,
      coverageRequestedOn: new Date()
    })

    this.logger.info(`Added successful`, {
      action: COUNTERPARTY_ACTIONS.ADD,
      companyId,
      memberCompanyId: this.companyStaticId
    })
    this.logger.metric({
      [Metric.Action]: [MetricAction.CounterpartyAdded],
      [Metric.State]: [MetricState.Success]
    })

    return this.sendCommonRequest(MESSAGE_TYPE.ConnectRequest, companyId, entity.coverageRequestId)
  }

  async resendCounterparty(companyId: string): Promise<void> {
    const company = await this.companyClient.getCompanyByStaticId(companyId)

    if (!company) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CompanyNotFound, {
        action: COUNTERPARTY_ACTIONS.ADD,
        companyId
      })

      throw new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST, `Company id ${companyId} not found`)
    }

    const counterparties = await this.companyCoverageDataAgent.find({
      companyId
    })

    if (counterparties && !counterparties.length) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CounterpartyNotFound, {
        action: COUNTERPARTY_ACTIONS.RESEND,
        companyId
      })

      throw new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST, `Counterparty request doesn't exist`)
    }

    let counterparty = this.filterCounterparties(counterparties, true, STATUSES.COMPLETED)
    if (counterparty) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyAlreadyAdded, {
        action: COUNTERPARTY_ACTIONS.RESEND,
        companyId,
        memberCompanyId: this.companyStaticId
      })

      throw new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST, `Company already added as counterparty`)
    }

    counterparty = this.filterCounterparties(counterparties, false, STATUSES.WAITING)
    if (counterparty) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyRequestApprove, {
        action: COUNTERPARTY_ACTIONS.RESEND,
        companyId,
        memberCompanyId: this.companyStaticId
      })

      throw new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST, `Company already waiting for approval`)
    }

    counterparty = this.filterCounterparties(counterparties, false, STATUSES.PENDING)
    if (counterparty) {
      this.logger.info(`Resend successful`, {
        action: COUNTERPARTY_ACTIONS.RESEND,
        companyId,
        memberCompanyId: this.companyStaticId
      })
      this.logger.metric({
        [Metric.Action]: [MetricAction.CounterpartyRequestResent],
        [Metric.State]: [MetricState.Success]
      })

      return this.sendCommonRequest(MESSAGE_TYPE.ConnectRequest, companyId, counterparty.coverageRequestId)
    }

    this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyInvalidStatus, {
      counterparty
    })
    throw new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST, `Counterparty request resending error`)
  }

  async addCounterpartyList(companyIds: string[]): Promise<void> {
    if (companyIds) {
      const failed = []
      await Promise.all(
        companyIds.map(companyId =>
          this.addCounterparty(companyId).catch(error => {
            failed.push({
              companyId,
              error
            })
          })
        )
      )

      if (failed.length) {
        if (companyIds.length === 1 && failed[0].error) {
          throw failed[0].error
        }

        throw new CounterpartyError(
          COUNTERPARTY_ERROR_CODE.GENERAL_ERROR,
          'Failed to process request for some companies'
        )
      }
    }

    return
  }

  async approveCounterparty(companyId: string): Promise<void> {
    const counterparty = await this.companyCoverageDataAgent.findOne({
      companyId,
      covered: false,
      status: STATUSES.WAITING
    })

    if (!counterparty) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CounterpartyNotFound, {
        action: COUNTERPARTY_ACTIONS.APPROVE,
        companyId
      })

      throw new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST, 'No proper request to approve')
    }

    Object.assign(counterparty, {
      covered: true,
      status: STATUSES.COMPLETED,
      coverageApprovedOn: new Date()
    })

    await this.companyCoverageDataAgent.update(counterparty.coverageRequestId, counterparty)
    await this.sendCommonRequest(MESSAGE_TYPE.ApproveConnectRequest, companyId, counterparty.coverageRequestId)
    await this.taskManagerClient.updateTaskStatus(
      getTaskStatusUpdateRequest(counterparty.coverageRequestId, TaskStatus.Done, true)
    )
    await this.createEmptyCounterpartyProfile(companyId)

    this.logger.info(`Counterparty approve successful`, {
      action: COUNTERPARTY_ACTIONS.APPROVE,
      companyId,
      requestId: counterparty.coverageRequestId,
      memberCompanyId: this.companyStaticId
    })
    this.logger.metric({
      [Metric.Action]: [MetricAction.CounterpartyApprovalReceived],
      [Metric.State]: [MetricState.Success]
    })

    return
  }

  async requestApproved(companyId: string, requestId: string): Promise<void> {
    const counterparty = await this.companyCoverageDataAgent.findOne({
      companyId,
      coverageRequestId: requestId,
      status: STATUSES.PENDING
    })

    if (!counterparty) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyRequestApproveFailed, {
        action: COUNTERPARTY_ACTIONS.REQUEST_APPROVED,
        companyId,
        requestId,
        memberCompanyId: this.companyStaticId
      })

      return
    }

    const company = await this.companyClient.getCompanyByStaticId(companyId)
    await this.approveRequest(companyId, company, requestId, counterparty)
    this.logger.metric({
      [Metric.Action]: [MetricAction.CounterpartyRequestApproved],
      [Metric.State]: [MetricState.Success]
    })
    return
  }

  async rejectCounterparty(companyId: string): Promise<void> {
    const counterparty = await this.companyCoverageDataAgent.findOne({
      companyId,
      covered: false,
      status: STATUSES.WAITING
    })

    if (!counterparty) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CounterpartyNotFound, {
        action: COUNTERPARTY_ACTIONS.REJECT,
        companyId
      })

      throw new CounterpartyError(COUNTERPARTY_ERROR_CODE.INVALID_REQUEST, 'No proper request to reject')
    }

    Object.assign(counterparty, {
      coverageRejectedOn: new Date(),
      covered: false,
      status: STATUSES.COMPLETED
    })

    await this.companyCoverageDataAgent.update(counterparty.coverageRequestId, counterparty)
    // send message that coverage is rejected
    await this.sendCommonRequest(MESSAGE_TYPE.RejectConnectRequest, companyId, counterparty.coverageRequestId)

    await this.taskManagerClient.updateTaskStatus(
      getTaskStatusUpdateRequest(counterparty.coverageRequestId, TaskStatus.Done, false)
    )

    this.logger.info(`Reject request sucessful`, {
      action: COUNTERPARTY_ACTIONS.REJECT,
      companyId,
      requestId: counterparty.coverageRequestId,
      memberCompanyId: this.companyStaticId
    })
    this.logger.metric({
      [Metric.Action]: [MetricAction.CounterpartyRejectionReceived],
      [Metric.State]: [MetricState.Success]
    })
  }

  async requestRejected(companyId: string, requestId: string): Promise<void> {
    const counterparty = await this.companyCoverageDataAgent.findOne({
      companyId,
      coverageRequestId: requestId
    })

    if (!counterparty) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CounterpartyNotFound, {
        action: COUNTERPARTY_ACTIONS.REQUEST_REJECTED,
        companyId,
        requestId,
        memberCompanyId: this.companyStaticId
      })

      return
    }

    if (counterparty.status !== STATUSES.PENDING) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CounterpartyInvalidStatus, {
        action: COUNTERPARTY_ACTIONS.REQUEST_REJECTED,
        companyId,
        requestId,
        memberCompanyId: this.companyStaticId
      })

      return
    }

    Object.assign(counterparty, {
      coverageRejectedOn: new Date(),
      covered: false,
      status: STATUSES.COMPLETED
    })

    await this.companyCoverageDataAgent.update(requestId, counterparty)
    this.logger.info(`Request rejected`, {
      action: COUNTERPARTY_ACTIONS.REQUEST_REJECTED,
      companyId,
      requestId,
      memberCompanyId: this.companyStaticId
    })

    // send notification
    const company = await this.companyClient.getCompanyByStaticId(companyId)
    if (!company) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CompanyNotFound, {
        action: COUNTERPARTY_ACTIONS.REQUEST_REJECTED,
        companyId,
        requestId,
        memberCompanyId: this.companyStaticId
      })

      return
    }
    await this.notificationClient.createNotification(getCounterpartyReqRejected(company.staticId, company.x500Name.CN))
    this.logger.metric({
      [Metric.Action]: [MetricAction.CounterpartyRequestRejected],
      [Metric.State]: [MetricState.Success]
    })
  }

  /**
   * Request for counterparty connection received from other company
   *
   * @param {string} companyId
   * @param {string} requestId
   * @returns {Promise<void>}
   * @memberof CounterpartyService
   */
  async addRequest(companyId: string, requestId: string): Promise<void> {
    const company = await this.companyClient.getCompanyByStaticId(companyId)
    if (!company) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CompanyNotFound, {
        action: COUNTERPARTY_ACTIONS.ADD_REQUEST,
        companyId
      })

      return
    }

    let counterparties = await this.companyCoverageDataAgent.find({
      companyId
    })

    if (!counterparties) {
      counterparties = []
    }

    // check if covered
    let counterparty = this.filterCounterparties(counterparties, true, STATUSES.COMPLETED)
    if (counterparty) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyAlreadyAdded, {
        action: COUNTERPARTY_ACTIONS.ADD_REQUEST,
        companyId,
        requestId,
        memberCompanyId: this.companyStaticId
      })
      this.logger.metric({
        [Metric.Action]: [MetricAction.CounterpartyRequestReceivedReprocessed],
        [Metric.State]: [MetricState.Success]
      })
      return this.sendCommonRequest(MESSAGE_TYPE.ApproveConnectRequest, companyId, requestId)
    }

    // check if rejected
    counterparty = this.filterCounterparties(counterparties, false, STATUSES.COMPLETED, requestId)
    if (counterparty) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyAlreadyRejected, {
        action: COUNTERPARTY_ACTIONS.ADD_REQUEST,
        companyId,
        requestId,
        memberCompanyId: this.companyStaticId
      })
      this.logger.metric({
        [Metric.Action]: [MetricAction.CounterpartyRequestReceivedReprocessed],
        [Metric.State]: [MetricState.Success]
      })
      return this.sendCommonRequest(MESSAGE_TYPE.RejectConnectRequest, companyId, requestId)
    }

    // Already requested and waiting for response
    counterparty = this.filterCounterparties(counterparties, false, STATUSES.WAITING)
    if (counterparty) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyAlreadyAdded, {
        action: COUNTERPARTY_ACTIONS.ADD_REQUEST,
        companyId,
        requestId,
        memberCompanyId: this.companyStaticId
      })

      return
    }

    counterparty = this.filterCounterparties(counterparties, false, STATUSES.PENDING)
    if (counterparty) {
      this.logger.warn(ErrorCode.DatabaseInvalidData, ErrorName.CounterpartyRequestAlreadyExist, {
        action: COUNTERPARTY_ACTIONS.REQUEST_SUPPRESSED,
        companyId,
        requestId,
        memberCompanyId: this.companyStaticId
      })
      this.logger.metric({
        [Metric.Action]: [MetricAction.CounterpartyRequestReceived],
        [Metric.State]: [MetricState.Success]
      })
      await this.approveRequest(
        companyId,
        company,
        counterparty.coverageRequestId,
        counterparty,
        'Request accepted because of mutual Counterparty request.'
      )
      return
    }

    const coverageRequest = await this.companyCoverageDataAgent.create({
      companyId,
      covered: false,
      status: STATUSES.WAITING,
      coverageRequestId: requestId
    })

    // create task
    const counterpartyReqTask = getCounterpartyReqReceived(
      coverageRequest.coverageRequestId,
      company.staticId,
      company.x500Name.CN
    )
    await this.taskManagerClient.createTask(counterpartyReqTask.task, counterpartyReqTask.notification.message)
    this.logger.info(`Successfuly added request for company`, {
      action: COUNTERPARTY_ACTIONS.ADD_REQUEST,
      companyId,
      requestId,
      memberCompanyId: this.companyStaticId
    })
    this.logger.metric({
      [Metric.Action]: [MetricAction.CounterpartyRequestApproved],
      [Metric.State]: [MetricState.Success]
    })
  }

  private async createEmptyCounterpartyProfile(companyId: string) {
    return this.counterpartyProfileDataAgent.create({
      id: undefined,
      counterpartyId: companyId,
      riskLevel: RiskLevel.unspecified,
      renewalDate: undefined,
      managedById: ''
    })
  }

  private async sendCommonRequest(messageType: MessageType, companyId: string, requestId: string) {
    return this.requestClient.sendCommonRequest(
      messageType,
      companyId,
      await this.createRequestMessage(messageType, companyId, requestId)
    )
  }

  private async createRequestMessage(
    messageType: MessageType,
    companyId: string,
    requestId: string
  ): Promise<CounterpartyRequestMessage> {
    return {
      context: {
        requestId
      },
      version: 1,
      messageType,
      data:
        messageType === MESSAGE_TYPE.ConnectRequest
          ? {
              requesterCompanyId: this.companyStaticId,
              receiverCompanyId: companyId,
              requestId
            }
          : {
              requesterCompanyId: companyId,
              receiverCompanyId: this.companyStaticId,
              requestId
            }
    }
  }

  private mapToCounterparty(counterParty: ICompanyCoverageDocument, company: ICoverageCompany): ICounterparty {
    const { staticId, hasSWIFTKey, isFinancialInstitution, isMember, x500Name } = company
    return {
      staticId,
      hasSWIFTKey,
      isFinancialInstitution,
      isMember,
      x500Name,
      covered: counterParty.covered,
      status: counterParty.status,
      coverageRequestId: counterParty.coverageRequestId,
      timestamp:
        counterParty.coverageApprovedOn ||
        counterParty.coverageAutoAddedOn ||
        counterParty.coverageRejectedOn ||
        counterParty.coverageRequestedOn ||
        null
    }
  }

  private retriveCompanies(companies: ICoverageCompany[], filter?: any): Promise<ICompanyCoverageDocument[]> {
    const companyIds = companies.map(x => x.staticId)
    return this.companyCoverageDataAgent.findByCompanyIds(companyIds, filter)
  }

  private mapCounterpartiesData(companies: ICoverageCompany[], counterparties: ICompanyCoverageDocument[]) {
    let counterpartiesMerged: ICounterparty[] = []
    if (counterparties) {
      counterpartiesMerged = counterparties.map(counterParty => {
        const company = companies.find(x => x.staticId === counterParty.companyId)

        return this.mapToCounterparty(counterParty, company)
      })
    }
    return counterpartiesMerged
  }

  private filterCounterparties(
    counterparties: ICompanyCoverageDocument[],
    covered: boolean,
    status: string,
    requestId?: string
  ): ICompanyCoverageDocument | undefined {
    return counterparties.find(x => {
      return requestId
        ? x.covered === covered && x.status === status && x.coverageRequestId === requestId
        : x.covered === covered && x.status === status
    })
  }

  private async approveRequest(
    companyId: string,
    company: ICoverageCompany | null,
    requestId: string,
    counterparty: ICompanyCoverageDocument,
    description?: string
  ): Promise<void> {
    Object.assign(counterparty, {
      coverageApprovedOn: new Date(),
      covered: true,
      description,
      status: STATUSES.COMPLETED
    })
    await this.companyCoverageDataAgent.update(requestId, counterparty)
    this.logger.info(`Request approved successful`, {
      action: COUNTERPARTY_ACTIONS.REQUEST_APPROVED,
      companyId,
      requestId,
      memberCompanyId: this.companyStaticId
    })
    if (!company) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CompanyNotFound, {
        action: COUNTERPARTY_ACTIONS.REQUEST_APPROVED,
        companyId,
        requestId,
        memberCompanyId: this.companyStaticId
      })
      return
    }
    await this.notificationClient.createNotification(
      await getCounterpartyReqApproved(company.staticId, company.x500Name.CN)
    )
  }
}
