import {
  RFPMessageType,
  IRFPMessage,
  IRFPPayload,
  ITradeMessage,
  TradeCargoRoutingKey,
  ICargoMessage
} from '@komgo/messaging-types'
import {
  buildFakeReceivablesDiscountingBase,
  IRFPRequestResponse,
  IRFPReplyResponse,
  IReceivablesDiscountingBase,
  IReceivablesDiscounting
} from '@komgo/types'
import { AxiosResponse } from 'axios'

import { AddDiscountingRequestType } from '../../src/business-layer/messaging/types/AddDiscountingRequestType'
import {
  IReceivableFinanceMessage,
  UpdateType,
  IRDUpdatePayload,
  ITradeSnapshotUpdatePayload,
  IAddDiscountingPayload
} from '../../src/business-layer/types'

import { Member } from './Member'
import { DEFAULT_COMMENT, createRequestMessage } from './test-utils'

export class Corporate extends Member {
  /**
   * Creates a new RD application as a corporate
   *
   * @param rdData ReceivablesDiscounting data
   */
  public async createNewRD(rdData = buildFakeReceivablesDiscountingBase(true)): Promise<string> {
    const response = await this.axiosInstance.post('/rd', rdData)
    return response.data.staticId
  }

  /**
   * Updates an RD as a corporate
   *
   * @param rdId ReceivablesDiscounting id
   */
  public async updateRD(rdId: string, rdData: IReceivablesDiscountingBase): Promise<AxiosResponse> {
    const response = await this.axiosInstance.put(`/rd/${rdId}`, rdData)
    return response
  }

  /**
   * Replaces an RD as a corporate
   *
   * @param rdId ReceivablesDiscounting id
   */
  public async replaceRD(rdId: string, rdData: IReceivablesDiscountingBase): Promise<AxiosResponse> {
    const response = await this.axiosInstance.put(`/rd/${rdId}?replace=true`, rdData)
    return response
  }

  /**
   * Shares the latest RD with the bank
   *
   * @param rdId ReceivablesDiscounting data
   */
  public async shareRD(rdId: string): Promise<AxiosResponse> {
    const response = await this.axiosInstance.post(`/rd/${rdId}/share`, { rdId })
    return response
  }

  /**
   * Sends an Add Discounting request to the bank
   *
   * @param rdId ReceivablesDiscounting id
   */
  public async addDiscounting(rdId: string): Promise<AxiosResponse> {
    const response = await this.axiosInstance.post(`/rd/${rdId}/add-discounting`, { rdId })
    return response
  }

  /**
   * Creates a new RFP Request as a corporate
   *
   * @param rdId RD ID
   * @param participantStaticIds list of participant financial institutions
   */
  public async createNewRFPRequest(rdId?: string, participantStaticIds?: string[]): Promise<IRFPRequestResponse> {
    const response = await this.axiosInstance.post('/request-for-proposal/request', {
      rdId,
      participantStaticIds
    })

    return response.data
  }

  /**
   * Creates a new quote acceptance as a corporate
   *
   * @param rdId RD ID
   * @param quoteId Quote ID
   * @param comment comment
   * @param participantStaticId company staticId of the financial institution
   */
  public async createNewQuoteAccept(
    rdId?: string,
    quoteId?: string,
    participantStaticId?: string,
    comment = DEFAULT_COMMENT
  ): Promise<IRFPReplyResponse> {
    const response = await this.axiosInstance.post('/request-for-proposal/accept-quote', {
      rdId,
      quoteId,
      participantStaticId,
      comment
    })

    return response.data
  }

  /**
   * Publishes a new RFP Request as a corporate to be received by a financial institution
   */
  public async publishRFPRequest(message = createRequestMessage(), options?: any): Promise<string> {
    await this.publishRFPMessage(message, RFPMessageType.Request, options)

    return message.data.productRequest.rd.staticId
  }

  /**
   * Publishes a new Quote acceptance as a corporate to be received by a financial institution
   */
  public async publishRFPAccept(message: IRFPMessage<IRFPPayload>, options?: any): Promise<void> {
    await this.publishRFPMessage(message, RFPMessageType.Accept, options)
  }

  /**
   * Publishes a new request decline as a corporate to be received by a financial institution
   */
  public async publishRFPDecline(message: IRFPMessage<IRFPPayload>, options?: any): Promise<void> {
    await this.publishRFPMessage(message, RFPMessageType.Decline, options)
  }

  /**
   * Publishes a RD update
   */
  public async publishRDUpdate(message: IReceivableFinanceMessage<IRDUpdatePayload>, options?: any): Promise<void> {
    await this.publishUpdateMessage(message, UpdateType.ReceivablesDiscounting, options)
  }

  public async publishTradeUpdateMessage(message: ITradeMessage, options?: any): Promise<void> {
    await this.tradeCargoPublisher.publish(TradeCargoRoutingKey.TradeUpdated, message, options)
  }

  public async publishCargoUpdateMessage(message: ICargoMessage, options?: any): Promise<void> {
    await this.tradeCargoPublisher.publish(TradeCargoRoutingKey.CargoUpdated, message, options)
  }

  public async publishAddDiscountingRequest(
    message: IReceivableFinanceMessage<IAddDiscountingPayload<IReceivablesDiscounting>>,
    options?: any
  ): Promise<void> {
    await this.publishAddDiscountingMessage(message, AddDiscountingRequestType.Add, options)
  }

  /**
   * Publishes a Trade Snapshot update
   */
  public async publishTradeSnapshotUpdate(
    message: IReceivableFinanceMessage<ITradeSnapshotUpdatePayload>,
    options?: any
  ): Promise<void> {
    await this.publishUpdateMessage(message, UpdateType.TradeSnapshot, options)
  }
}
