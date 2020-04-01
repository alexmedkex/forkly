import { PublisherMicroservice } from '@komgo/integration-test-utilities'
import { IRFPMessage, RFPMessageType, IDocumentReceivedMessage } from '@komgo/messaging-types'
import {
  buildFakeQuoteBase,
  IQuote,
  IReceivablesDiscountingInfo,
  IRFPSummariesResponse,
  IHistory,
  IReceivablesDiscounting,
  ITradeSnapshot,
  RequestType,
  DiscountingType,
  IParticipantRFPSummary
} from '@komgo/types'
import Axios, { AxiosInstance } from 'axios'
import { Container } from 'inversify'
import { v4 as uuid4 } from 'uuid'

import { DOCUMENT_ROUTING_KEY } from '../../src/business-layer/messaging/constants'
import { AddDiscountingRequestType } from '../../src/business-layer/messaging/types/AddDiscountingRequestType'
import { IReceivableFinanceMessage, UpdateType } from '../../src/business-layer/types'
import { VALUES } from '../../src/inversify/values'
import { IPaginate } from '../../src/service-layer/responses/IPaginate'

import {
  createRequestMessage,
  buildUpdateRoutingKey,
  buildAddDiscountingRoutingKey,
  buildRFPRoutingKey
} from './test-utils'

export const MOCK_ENCODED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

/**
 * class representing a member that can be a financial institution or a corporate
 */
export abstract class Member {
  public readonly companyStaticId: string

  protected readonly axiosInstance: AxiosInstance
  protected publisherMicroservice: PublisherMicroservice
  protected inboundPublisher: PublisherMicroservice
  protected tradeCargoPublisher: PublisherMicroservice
  protected documentsPublisher: PublisherMicroservice

  constructor() {
    this.companyStaticId = uuid4()
    this.axiosInstance = Axios.create({
      baseURL: 'http://localhost:8080/v0',
      headers: { Authorization: `Bearer ${MOCK_ENCODED_JWT}` }
    })
  }

  public async beforeEach(iocContainer: Container) {
    this.publisherMicroservice = new PublisherMicroservice(iocContainer.get<string>(VALUES.RFPPublisherId))
    await this.publisherMicroservice.beforeEach()
    this.inboundPublisher = new PublisherMicroservice(iocContainer.get<string>(VALUES.InboundPublisherId))
    await this.inboundPublisher.beforeEach()
    this.tradeCargoPublisher = new PublisherMicroservice(iocContainer.get<string>(VALUES.TradeCargoPublisherId))
    await this.tradeCargoPublisher.beforeEach()
    this.documentsPublisher = new PublisherMicroservice(iocContainer.get<string>(VALUES.DocumentsPublisherId))
    await this.documentsPublisher.beforeEach()
  }

  public async afterEach() {
    await this.publisherMicroservice.afterEach()
    await this.inboundPublisher.afterEach()
    await this.tradeCargoPublisher.afterEach()
    await this.documentsPublisher.afterEach()
  }

  /**
   * Gets the RD Info
   *
   * @param rdId RD ID
   */
  public async getRDInfo(rdId: string): Promise<IReceivablesDiscountingInfo> {
    const response = await this.axiosInstance.get(`/info/rd/${rdId}`)
    return response.data
  }

  /**
   * Gets the RD history
   *
   * @param rdId RD ID
   */
  public async getRDHistory(rdId: string): Promise<IHistory<IReceivablesDiscounting>> {
    const response = await this.axiosInstance.get(`/rd/${rdId}/history`)
    return response.data
  }

  /**
   * Gets RFP summaries for one RD
   *
   * @param rdId RD ID
   */
  public async getRFPSummaries(rdId: string): Promise<IRFPSummariesResponse> {
    const response = await this.axiosInstance.get(`/rd/${rdId}/request-for-proposal`)
    return response.data
  }

  /**
   * Gets RFP summary of one participant
   *
   * @param rdId RD ID
   * @param participantId participant static id
   */
  public async getParticipantRFPSummary(rdId: string, participantId: string): Promise<IParticipantRFPSummary> {
    const response = await this.axiosInstance.get(`/rd/${rdId}/request-for-proposal/${participantId}`)
    return response.data
  }

  public async getRDInfoWithFilter(filter?: string): Promise<IPaginate<IReceivablesDiscountingInfo[]>> {
    const response = filter
      ? await this.axiosInstance.get(`/info/rd?filter=${filter}`)
      : await this.axiosInstance.get('/info/rd')
    return response.data
  }

  /**
   * Creates a new quote
   *
   * @param quoteData Quote data
   */
  public async createNewQuote(
    quoteData = buildFakeQuoteBase({}, RequestType.Discount, DiscountingType.WithoutRecourse)
  ): Promise<string> {
    const response = await this.axiosInstance.post('/quote', quoteData)

    return response.data.staticId
  }

  /**
   * Gets a quote
   *
   * @param quoteId Quote ID
   */
  public async getQuote(quoteId?: string): Promise<IQuote> {
    const response = await this.axiosInstance.get(`quote/${quoteId}`)
    return response.data
  }

  /**
   * Gets a quote history
   *
   * @param quoteId Quote ID
   */
  public async getQuoteHistory(quoteId?: string): Promise<IHistory<IQuote>> {
    const response = await this.axiosInstance.get(`quote/${quoteId}/history`)
    return response.data
  }

  /**
   * Publishes a Document received
   */
  public async publishDocumentReceived(message: IDocumentReceivedMessage, options?: any): Promise<void> {
    await this.documentsPublisher.publish(DOCUMENT_ROUTING_KEY, message, options)
  }
  /**
   * Publishes an invalid message
   */
  public async publishInvalidMessage(message: IRFPMessage<any> = createRequestMessage(), options?: any): Promise<void> {
    await this.publisherMicroservice.publish('INTERNAL.RFP.tradeFinance.rd.Invalid', message, options)
  }

  /**
   * Gets a trade snapshot history
   *
   * @param sourceId Trade source ID
   */
  public async getTradeSnapshotHistory(sourceId?: string): Promise<IHistory<ITradeSnapshot>> {
    const response = await this.axiosInstance.get(`trade/${sourceId}/history`)
    return response.data
  }

  protected async publishRFPMessage(message: IRFPMessage<any>, type: RFPMessageType, options?: any): Promise<void> {
    await this.publisherMicroservice.publish(buildRFPRoutingKey(type), message, options)
  }

  protected async publishUpdateMessage(
    message: IReceivableFinanceMessage<any>,
    type: UpdateType,
    options?: any
  ): Promise<void> {
    await this.inboundPublisher.publish(buildUpdateRoutingKey(type), message, options)
  }

  protected async publishAddDiscountingMessage(
    message: IReceivableFinanceMessage<any>,
    type: AddDiscountingRequestType,
    options?: any
  ): Promise<void> {
    await this.inboundPublisher.publish(buildAddDiscountingRoutingKey(type), message, options)
  }
}
