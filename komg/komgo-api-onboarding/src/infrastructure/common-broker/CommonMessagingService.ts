import { getLogger } from '@komgo/logging'
import Axios, { AxiosInstance } from 'axios'
import * as crypto from 'crypto'
import * as http from 'http'
import * as httpProxyAgent from 'http-proxy-agent'
import * as https from 'https'
import * as httpsProxyAgent from 'https-proxy-agent'
import { inject, injectable } from 'inversify'

import ICommonMessagingService, {
  IRabbitExchangeOptions,
  IRabbitUserOptions,
  IRabbitQueueOptions,
  IRabbitBindingOptions,
  IRabbitPolicyOptions,
  IRabbitPermissionOptions
} from './ICommonMessagingService'
import { IVhostsResponse } from './types'

const JSON_MIME_TYPE = 'application/json'

@injectable()
export default class CommonMessagingService implements ICommonMessagingService {
  private readonly axios: AxiosInstance
  private readonly logger = getLogger('CommonMessagingAgent')

  constructor(
    @inject('common-mq-base-url') mqBaseUrl: string,
    @inject('common-mq-username') mqUsername: string,
    @inject('common-mq-password') mqPassword: string,
    @inject('max-content-length') axiosMaxContentLength: number,
    @inject('request-timeout') requestTimeoutMs: number
  ) {
    const httpAgentProxy = process.env.HTTP_PROXY
      ? new httpProxyAgent(process.env.HTTP_PROXY)
      : new http.Agent({ keepAlive: true })
    const httpsAgentProxy = process.env.HTTPS_PROXY
      ? new httpsProxyAgent(process.env.HTTPS_PROXY)
      : new https.Agent({ keepAlive: true })

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

  async getVhosts(): Promise<IVhostsResponse> {
    const resp = await this.axios.get('/vhosts')
    return resp.data
  }

  async assertUser(username: string, password: string, opts?: IRabbitUserOptions) {
    const salt = Buffer.from('CAD5089B', 'hex')
    const conc = Buffer.concat([salt, Buffer.from(password, 'utf-8')])
    const hash = crypto
      .createHash('SHA256')
      .update(conc)
      .digest()
    const data = Buffer.concat([salt, hash]).toString('base64')
    return this.axios.put(`/users/${username}`, {
      password_hash: data,
      tags: 'management',
      ...opts
    })
  }

  async assertExchange(name: string, type: string, opts?: IRabbitExchangeOptions) {
    return this.axios.put(`/exchanges/%2F/${name}`, { type, ...opts })
  }

  async assertQueue(name: string, opts?: IRabbitQueueOptions) {
    return this.axios.put(`/queues/%2F/${name}`, opts)
  }

  async assertBinding(fromExchange: string, toQueue: string, opts?: IRabbitBindingOptions) {
    return this.axios.post(`/bindings/%2F/e/${fromExchange}/q/${toQueue}`, opts)
  }

  async assertPolicy(policyname: string, opts?: IRabbitPolicyOptions) {
    return this.axios.put(`/policies/%2F/${policyname}`, {
      pattern: '.*',
      priority: 1,
      'apply-to': 'queues',
      definition: {},
      ...opts
    })
  }

  async assertPermission(username: string, opts?: IRabbitPermissionOptions) {
    return this.axios.put(`/permissions/%2F/${username}`, {
      configure: '^$',
      read: '^$',
      write: '^$',
      ...opts
    })
  }

  async configure(mnid: string, rabbitMQCommonUser: string, rabbitMQCommonPassword: string): Promise<void> {
    this.logger.info('Setting up RMQ users....')
    await this.assertUser(rabbitMQCommonUser, rabbitMQCommonPassword, { tags: 'management' })

    this.logger.info('Setting up RMQ exchanges...')
    await this.assertExchange(`${mnid}-EXCHANGE-ALT`, 'direct', { durable: true })
    await this.assertExchange(`${mnid}-EXCHANGE`, 'direct', { durable: true })
    await this.assertExchange(`${mnid}-EXCHANGE-ACK`, 'direct', { durable: true })
    await this.assertPolicy(`${mnid}-EXCHANGE-ALT`, {
      pattern: `^${mnid}-EXCHANGE(-ACK)?$`,
      'apply-to': 'exchanges',
      definition: {
        'alternate-exchange': `${mnid}-EXCHANGE-ALT`
      }
    })

    this.logger.info('Setting up RMQ queues...')
    await this.assertQueue(`${mnid}-QUEUE-ALT`, { durable: true })
    await this.assertQueue(`${mnid}-QUEUE`, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': `${mnid}-EXCHANGE-ACK` }
    })
    await this.assertQueue(`${mnid}-QUEUE-ACK`, { durable: true })

    this.logger.info('Setting up RMQ bindings...')
    await this.assertBinding(`${mnid}-EXCHANGE-ALT`, `${mnid}-QUEUE-ALT`, { routing_key: '#' })
    await this.assertBinding(`${mnid}-EXCHANGE`, `${mnid}-QUEUE`, { routing_key: 'komgo.internal' })
    await this.assertBinding(`${mnid}-EXCHANGE-ACK`, `${mnid}-QUEUE-ACK`, { routing_key: 'komgo.internal' })

    this.logger.info('Setting up RMQ permissions...')
    await this.assertPermission(`${mnid}-USER`, {
      read: `^${mnid}-QUEUE(-ACK|-ALT)?`,
      write: `(.*(?<!INBOUND)-EXCHANGE)(?!-)|${mnid}-EXCHANGE-ACK`
    })
  }
}
