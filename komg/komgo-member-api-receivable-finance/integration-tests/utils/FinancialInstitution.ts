import { IRFPMessage, RFPMessageType, IRFPPayload } from '@komgo/messaging-types'
import { IRFPReplyResponse, buildFakeQuoteBase, IQuote } from '@komgo/types'
import { AxiosResponse } from 'axios'

import { IReceivableFinanceMessage, UpdateType, IUpdatePayload } from '../../src/business-layer/types'

import { Member } from './Member'
import { DEFAULT_COMMENT } from './test-utils'

export class FinancialInstitution extends Member {
  /**
   * Creates a new RFP Rejection as a financial institution
   *
   * @param rdId RD ID
   * @param comment comment
   */
  public async createNewRFPRejection(rdId?: string, comment = DEFAULT_COMMENT): Promise<IRFPReplyResponse> {
    const response = await this.axiosInstance.post('/request-for-proposal/reject', {
      rdId,
      comment
    })

    return response.data
  }

  /**
   * Creates a new quote submission as a financial institution
   *
   * @param rdId RD ID
   * @param quoteId Quote ID
   * @param comment comment
   */
  public async createNewQuoteSubmission(
    rdId?: string,
    quoteId?: string,
    comment = DEFAULT_COMMENT
  ): Promise<IRFPReplyResponse> {
    const response = await this.axiosInstance.post('/request-for-proposal/submit-quote', {
      rdId,
      quoteId,
      comment
    })

    return response.data
  }

  /**
   * Publishes a new RFP Reject as a financial institution to be received by a corporate
   */
  public async publishRFPReject(message: IRFPMessage<IRFPPayload>, options?: any): Promise<void> {
    await this.publishRFPMessage(message, RFPMessageType.Reject, options)
  }

  /**
   * Publishes a new RFP Response as a financial institution to be received by a corporate
   */
  public async publishRFPResponse(message: IRFPMessage<IRFPPayload>, options?: any): Promise<void> {
    await this.publishRFPMessage(message, RFPMessageType.Response, options)
  }

  /**
   * Publishes an update to Final agreed terms
   */
  public async publishFinalAgreedTermsUpdate(
    message: IReceivableFinanceMessage<IUpdatePayload<IQuote>>,
    options?: any
  ): Promise<void> {
    await this.publishUpdateMessage(message, UpdateType.FinalAgreedTermsData, options)
  }

  /**
   * updates a quote
   *
   * @param quoteId Quote id
   * @param quoteData Quote data
   */
  public async updateQuote(quoteId: string, quoteData = buildFakeQuoteBase()): Promise<IQuote> {
    const response = await this.axiosInstance.put(`/quote/${quoteId}`, quoteData)
    return response.data
  }

  /**
   * Shares a quote with a trader
   */
  public shareQuote(quoteId: string): Promise<AxiosResponse<any>> {
    return this.axiosInstance.post(`/quote/${quoteId}/share`)
  }
}
