import { IVhostsResponse } from './types'

export default interface ICommonMessagingService {
  getVhosts(): Promise<IVhostsResponse>
  configure(komgoMnid: string, rabbitMQCommonUser: string, rabbitMQCommonPassword: string): Promise<void>
}

export interface IRabbitExchangeOptions {
  readonly durable?: boolean
}

export interface IRabbitUserOptions {
  readonly tags?: string
}

export interface IRabbitQueueArguments {
  readonly 'x-dead-letter-exchange'?: string
}

export interface IRabbitQueueOptions {
  readonly durable?: boolean
  readonly arguments?: IRabbitQueueArguments
}

export interface IRabbitBindingOptions {
  readonly routing_key?: string
}

export interface IRabbitPolicyOptions {
  readonly pattern?: string
  readonly priority?: number
  readonly 'apply-to'?: string
  readonly definition?: { [key: string]: string | boolean }
}

export interface IRabbitPermissionOptions {
  readonly configure?: string
  readonly read?: string
  readonly write?: string
}
