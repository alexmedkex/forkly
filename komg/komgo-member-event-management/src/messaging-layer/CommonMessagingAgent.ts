import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import Axios, { AxiosInstance } from 'axios'
import * as http from 'http'
import * as httpProxyAgent from 'http-proxy-agent'
import * as https from 'https'
import * as httpsProxyAgent from 'https-proxy-agent'
import { inject, injectable } from 'inversify'
import * as JSONStream from 'JSONStream'
import { v4 as uuid4 } from 'uuid'

import { ICompanyRegistryAgent } from '../data-layer/data-agent/ICompanyRegistryAgent'
import { TYPES } from '../inversify/types'
import { ErrorName } from '../util/ErrorName'

import CommonMessageReceived from './CommonMessageReceived'
import { CommonMessagingError } from './CommonMessagingError'
import { HEADERS } from './consts'
import ICommonMessagingAgent from './ICommonMessagingAgent'
import { MessageTooLargeError } from './MessageTooLargeError'
import { IEncryptedEnvelope, ICommonMessageProperties, ISendMessageResponse, IVhostsResponse } from './types'

const JSON_MIME_TYPE = 'application/json'
const CONTENT_ENCODING = 'utf-8'
const ENVELOPE_VERSION = '0001'
const HTTP_PAYLOAD_TOO_LARGE = 413

@injectable()
export default class CommonMessagingAgent implements ICommonMessagingAgent {
  private axios: AxiosInstance
  private companyKomgoMnid
  private logger = getLogger('CommonMessagingAgent')

  constructor(
    @inject('common-mq-base-url') mqBaseUrl: string,
    @inject('common-mq-username') mqUsername: string,
    @inject('common-mq-password') mqPassword: string,
    @inject('max-content-length') axiosMaxContentLength: number,
    @inject('request-timeout') requestTimeoutMs: number,
    @inject(TYPES.CompanyRegistryAgent) private companyRegistryAgent: ICompanyRegistryAgent | any
  ) {
    const httpAgentProxy = process.env.HTTP_PROXY
      ? new httpProxyAgent(process.env.HTTP_PROXY)
      : new http.Agent({ keepAlive: true })
    const httpsAgentProxy = process.env.HTTPS_PROXY
      ? new httpsProxyAgent(process.env.HTTPS_PROXY)
      : new https.Agent({ keepAlive: true })

    this.logger.info(`connecting to: ${mqBaseUrl}, ${mqUsername}, '<mqPassword> (not logged)'`)
    this.axios = Axios.create({
      baseURL: `${mqBaseUrl}/api`,
      timeout: requestTimeoutMs,
      withCredentials: true,
      auth: {
        username: mqUsername,
        password: mqPassword
      },
      httpAgent: httpAgentProxy,
      httpsAgent: httpsAgentProxy,
      maxContentLength: axiosMaxContentLength,
      proxy: false, // disable proxy autoconfiguration
      headers: { 'Content-Type': JSON_MIME_TYPE }
    })
    this.logger.addLoggingToAxios(this.axios, true)
  }

  sendMessage(
    routingKey: string,
    recipientExchange: string,
    message: IEncryptedEnvelope,
    properties: ICommonMessageProperties
  ): Promise<ISendMessageResponse> {
    // generate a messageId if not provided
    const messageId = properties.messageId ? properties.messageId : uuid4()

    const headers = {}
    headers[HEADERS.RecipientMnid] = properties.recipientMnid
    headers[HEADERS.SenderMnid] = properties.senderMnid
    headers[HEADERS.SenderPlatform] = properties.senderPlatform
    headers[HEADERS.SenderStaticId] = properties.senderStaticId
    headers[HEADERS.EnvelopeVersion] = ENVELOPE_VERSION

    Object.keys(headers).forEach(key => headers[key] === undefined && delete headers[key]) // filter out undefined keys

    const rawAmqp = {
      routing_key: routingKey,
      payload: JSON.stringify(message),
      payload_encoding: 'string',
      properties: {
        timestamp: Date.now(),
        correlation_id: properties.correlationId,
        message_id: messageId,
        content_type: JSON_MIME_TYPE,
        content_encoding: CONTENT_ENCODING,
        delivery_mode: 2, // persistent=true
        headers
      }
    }
    this.logger.info('Outbound raw AMQP', {
      ...rawAmqp,
      payload: '[retracted]'
    })
    return this.axios
      .post<ISendMessageResponse>(`/exchanges/%2F/${recipientExchange}/publish`, rawAmqp)
      .then(response => response.data)
      .catch(error => {
        const httpStatusCode = error.response ? error.response.status : -1

        this.logger.error(ErrorCode.ConnectionCommonMQ, ErrorName.SendToCommonMQBrokerFailed, error.message, {
          errno: error.code,
          httpStatusCode,
          messageId,
          recipientExchange
        })

        if (httpStatusCode === HTTP_PAYLOAD_TOO_LARGE) {
          throw new MessageTooLargeError('Payload too large')
        } else {
          throw error
        }
      })
  }

  async getMessage(staticId: string): Promise<CommonMessageReceived> {
    const ackMessages = await this.readMessagesFromAckQueue(staticId)
    const ackCount = ackMessages.length
    if (ackCount > 1) {
      throw new CommonMessagingError(
        `[CommonMessagingAgent] More than 1 message in the ACK queue '${staticId}'. Currently only supports 1 message ack`
      )
    } else if (ackCount === 1) {
      return ackMessages[0]
    } else {
      return this.readMessageFromMainQueue(staticId)
    }
  }

  async ackMessage(staticId: string): Promise<boolean> {
    const ackMessages = await this.readAndClearMessagesFromAckQueue(staticId)
    const ackCount = ackMessages.length
    if (ackCount > 1) {
      throw new CommonMessagingError(
        '[CommonMessagingAgent] More than 1 message in the ACK queue. Currently only supports 1 message ack'
      )
    } else if (ackCount === 1) {
      return true
    } else {
      this.logger.info('Nothing to ack on Common Broker for member', { staticId })
      return false
    }
  }

  async getVhosts(): Promise<IVhostsResponse> {
    const resp = await this.axios.get('/vhosts')
    return resp.data
  }

  private async readMessageFromMainQueue(staticId: string): Promise<CommonMessageReceived> {
    const messages = await this.getMessagesFromQueue(await this.getMainQueueName(staticId), 'reject_requeue_false')
    return messages[0]
  }

  private async readMessagesFromAckQueue(staticId: string): Promise<CommonMessageReceived[]> {
    return this.getMessagesFromQueue(await this.getAckQueueName(staticId), 'ack_requeue_true')
  }

  private async readAndClearMessagesFromAckQueue(staticId: string): Promise<CommonMessageReceived[]> {
    return this.getMessagesFromQueue(await this.getAckQueueName(staticId), 'ack_requeue_false')
  }

  private async getMainQueueName(staticId: string): Promise<string> {
    if (!this.companyKomgoMnid) {
      this.companyKomgoMnid = await this.companyRegistryAgent.getMnidFromStaticId(staticId)
    }
    return `${this.companyKomgoMnid}-QUEUE`
  }

  private async getAckQueueName(staticId: string): Promise<string> {
    if (!this.companyKomgoMnid) {
      this.companyKomgoMnid = await this.companyRegistryAgent.getMnidFromStaticId(staticId)
    }
    return `${this.companyKomgoMnid}-QUEUE-ACK`
  }

  private getMessagesFromQueue(queueName: string, ackMode: string): Promise<CommonMessageReceived[]> {
    return this.axios
      .post(
        `/queues/%2F/${queueName}/get`,
        {
          count: 1, // fixed count for now in the ack flow
          ackmode: ackMode,
          encoding: 'auto'
        },
        {
          responseType: 'stream',
          transformResponse: [res => res] // added to replace the default JSON.parse() for big files
        }
      )
      .then(response => {
        return new Promise<CommonMessageReceived[]>(resolve => {
          const resultArray: CommonMessageReceived[] = []
          response.data
            .pipe(JSONStream.parse('*'))
            .on('data', item => {
              this.logger.info('Inbound raw AMQP', {
                ...item,
                payload: '[retracted]'
              })
              resultArray.push(
                new CommonMessageReceived(item.routing_key, item, {
                  messageId: item.properties.message_id,
                  correlationId: item.properties.correlation_id,

                  recipientMnid: item.properties.headers[HEADERS.RecipientMnid],

                  senderMnid: item.properties.headers[HEADERS.SenderMnid],
                  senderStaticId: item.properties.headers[HEADERS.SenderStaticId],
                  senderPlatform: item.properties.headers[HEADERS.SenderPlatform]
                })
              )
            })
            .on('end', () => resolve(resultArray))
        })
      })
      .catch(error => {
        const httpStatusCode = error.response ? error.response.status : -1

        this.logger.error(ErrorCode.ConnectionCommonMQ, ErrorName.GetFromCommonMQBrokerFailed, error.message, {
          error: 'GetFromCommonMQBrokerFailed',
          host: error.host,
          errno: error.code,
          httpStatusCode,
          queueName,
          ackMode
        })

        throw error
      })
  }
}
