import https from 'https'
import fetch from 'node-fetch'
import crypto from 'crypto'

export interface RabbitOptions {
  readonly schema: string
  readonly hostname: string
  readonly hostport: string
  readonly username: string
  readonly password: string
}

export interface RabbitQueueArguments {
  readonly 'x-dead-letter-exchange'?: string
}

export interface RabbitQueueOptions {
  readonly durable?: boolean
  readonly arguments?: RabbitQueueArguments
}

export interface RabbitExchangeOptions {
  readonly durable?: boolean
}

export interface RabbitBindingOptions {
  readonly routing_key?: string
}

export interface RabbitUserOptions {
  readonly tags?: string
}

export interface RabbitPermissionOptions {
  readonly configure?: string
  readonly read?: string
  readonly write?: string
}

export interface RabbitPolicyOptions {
  readonly pattern?: string
  readonly priority?: number
  readonly 'apply-to'?: string
  readonly definition?: { [key: string]: string | boolean }
}

export interface RabbitShovelOptions {
  readonly 'src-protocol': string
  readonly 'src-uri': string
  readonly 'src-queue': string
  readonly 'dest-protocol': string
  readonly 'dest-uri': string
  readonly 'dest-exchange': string
  readonly 'dest-exchange-key': string
}

export class Rabbit {
  readonly schema: string
  readonly hostname: string
  readonly hostport: string
  readonly username: string
  readonly password: string

  constructor(opts: RabbitOptions) {
    this.schema = opts.schema
    this.username = opts.username
    this.password = opts.password
    this.hostname = opts.hostname
    this.hostport = opts.hostport
  }

  public async fetch(methodName: string, route: string, payload?: object) {
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64')
    const resp = await fetch(`${this.schema}://${this.hostname}:${this.hostport}/api${route}`, {
      method: methodName,
      body: JSON.stringify(payload || {}),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + auth
      }
    })
    if (!resp.ok) {
      throw new Error(resp.statusText + ':' + (await resp.text()))
    }
    return resp
  }

  public async assertQueue(name: string, opts?: RabbitQueueOptions) {
    return this.fetch(`put`, `/queues/%2F/${name}`, opts)
  }

  public async assertExchange(name: string, type: string, opts?: RabbitExchangeOptions) {
    return this.fetch(`put`, `/exchanges/%2F/${name}`, { type, ...opts })
  }

  public async assertBinding(fromExchange: string, toQueue: string, opts?: RabbitBindingOptions) {
    return this.fetch(`post`, `/bindings/%2F/e/${fromExchange}/q/${toQueue}`, opts)
  }

  public async assertUser(username: string, password: string, opts?: RabbitUserOptions) {
    const salt = Buffer.from('CAD5089B', 'hex')
    const conc = Buffer.concat([salt, Buffer.from(password, 'utf-8')])
    const hash = crypto
      .createHash('SHA256')
      .update(conc)
      .digest()
    const data = Buffer.concat([salt, hash]).toString('base64')
    return this.fetch(`put`, `/users/${username}`, {
      password_hash: data,
      tags: 'management',
      ...opts
    })
  }

  public async assertPermission(username: string, opts?: RabbitPermissionOptions) {
    return this.fetch(`put`, `/permissions/%2F/${username}`, {
      configure: '^$',
      read: '^$',
      write: '^$',
      ...opts
    })
  }

  public async assertPolicy(policyname: string, opts?: RabbitPolicyOptions) {
    return this.fetch(`put`, `/policies/%2F/${policyname}`, {
      pattern: '.*',
      priority: 1,
      'apply-to': 'queues',
      definition: {},
      ...opts
    })
  }

  public async assertShovel(shovelname: string, opts: RabbitShovelOptions) {
    return this.fetch(`put`, `/parameters/shovel/%2f/${shovelname}`, {
      value: opts
    })
  }
}
