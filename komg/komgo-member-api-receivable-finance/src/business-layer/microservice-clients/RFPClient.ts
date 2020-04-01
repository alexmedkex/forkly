import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { RFPMessageType } from '@komgo/messaging-types'
import {
  ICreateRFPRequest,
  ICreateRFPResponse,
  IRFPAcceptResponse,
  IRFPReplyResponse,
  IRFPRequestResponse,
  ReplyType
} from '@komgo/types'
import { AxiosInstance } from 'axios'
import { inject, injectable } from 'inversify'

import { ErrorName } from '../../ErrorName'
import { TYPES, VALUES } from '../../inversify'
import { FailureType, MessageDirection, MessageStatus, Metric } from '../../Metric'
import { MicroserviceClientError } from '../errors'

import { executePostRequest } from './utils'

const POST_ERROR_MESSAGE = 'Invalid response returned from api-rfp for POST to create RFP reply'
const INVALID_RESPONSE_FORMAT = 'Invalid response format'

@injectable()
export class RFPClient {
  private readonly logger = getLogger('RFPClient')
  private readonly apiRFPURL: string

  constructor(
    @inject(VALUES.ApiRFPBaseURL) apiRFPBaseURL: string,
    @inject(TYPES.AxiosInstance) private readonly axios: AxiosInstance
  ) {
    this.apiRFPURL = apiRFPBaseURL + '/v0'
  }

  /**
   * Posts a RFP Request to the RFP MS
   *
   * @param rfpRequest RFP request
   * @throws MicroserviceClientError if the data is invalid or the connection to the MS failed
   */
  public async postRFPRequest(rfpRequest: ICreateRFPRequest): Promise<IRFPRequestResponse> {
    const response = await executePostRequest(this.logger, this.axios, `${this.apiRFPURL}/request`, rfpRequest)

    const data: IRFPRequestResponse = response.data
    if (!data || !data.staticId || !data.actionStatuses || data.actionStatuses.length === 0) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorName.RFPClientInvalidPostRequest,
        'Invalid response returned from api-rfp for POST to create RFP',
        {
          data
        }
      )
      this.logger.metric({
        [Metric.MessageDirection]: MessageDirection.Outbound,
        [Metric.MessageStatus]: MessageStatus.Failed,
        [Metric.RFPMessageType]: 'request',
        [Metric.FailureType]: FailureType.MicroserviceInvalidResponseData
      })

      throw new MicroserviceClientError(INVALID_RESPONSE_FORMAT, data)
    }

    this.logger.metric({
      [Metric.MessageDirection]: MessageDirection.Outbound,
      [Metric.MessageStatus]: MessageStatus.Success,
      [Metric.RFPMessageType]: 'request',
      rfpId: data.staticId
    })

    return data
  }

  /**
   * Posts a RFP Response to the RFP MS
   *
   * @param  data RFP response
   * @throws MicroserviceClientError if the data is invalid or the connection to the MS failed
   */
  public async postRFPResponse(
    rfpId: string,
    postData: ICreateRFPResponse,
    type: ReplyType
  ): Promise<IRFPReplyResponse> {
    let responseType: string
    if (type === ReplyType.Submitted) {
      responseType = 'response'
    } else if (type === ReplyType.Reject) {
      responseType = 'reject'
    }

    const response = await executePostRequest(
      this.logger,
      this.axios,
      `${this.apiRFPURL}/${responseType}/${rfpId}`,
      postData
    )

    const data: IRFPReplyResponse = response.data
    if (!data || !data.rfpId || !data.actionStatus) {
      this.logger.error(ErrorCode.ConnectionMicroservice, ErrorName.RFPClientInvalidPostResponse, POST_ERROR_MESSAGE, {
        data
      })
      this.logger.metric({
        [Metric.MessageDirection]: MessageDirection.Outbound,
        [Metric.MessageStatus]: MessageStatus.Failed,
        [Metric.RFPMessageType]: RFPMessageType.Response,
        [Metric.ReplyType]: type,
        [Metric.FailureType]: FailureType.MicroserviceInvalidResponseData,
        rfpId
      })

      throw new MicroserviceClientError(INVALID_RESPONSE_FORMAT, data)
    }

    this.logger.metric({
      [Metric.MessageDirection]: MessageDirection.Outbound,
      [Metric.MessageStatus]: MessageStatus.Success,
      [Metric.RFPMessageType]: RFPMessageType.Response,
      [Metric.ReplyType]: type,
      rfpId
    })

    return response.data
  }

  /**
   * Posts a RFP Response to the RFP MS
   *
   * @param data RFP response
   * @throws MicroserviceClientError if the data is invalid or the connection to the MS failed
   */
  public async postRFPAccept(rfpId: string, postData: ICreateRFPResponse): Promise<IRFPAcceptResponse> {
    const response = await executePostRequest(this.logger, this.axios, `${this.apiRFPURL}/accept/${rfpId}`, postData)

    const data: IRFPAcceptResponse = response.data
    if (!data || !data.rfpId || !data.actionStatuses) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorName.RFPClientInvalidAcceptPostResponse,
        POST_ERROR_MESSAGE,
        { data }
      )
      this.logger.metric({
        [Metric.MessageDirection]: MessageDirection.Outbound,
        [Metric.MessageStatus]: MessageStatus.Failed,
        [Metric.RFPMessageType]: RFPMessageType.Accept,
        [Metric.ReplyType]: ReplyType.Accepted,
        [Metric.FailureType]: FailureType.MicroserviceInvalidResponseData,
        rfpId
      })

      throw new MicroserviceClientError(INVALID_RESPONSE_FORMAT, data)
    }

    this.logger.metric({
      [Metric.MessageDirection]: MessageDirection.Outbound,
      [Metric.MessageStatus]: MessageStatus.Success,
      [Metric.RFPMessageType]: RFPMessageType.Accept,
      [Metric.ReplyType]: ReplyType.Accepted,
      rfpId
    })

    return response.data
  }
}
