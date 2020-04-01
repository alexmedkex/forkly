import { ErrorName } from '../utils/ErrorName'

export interface IContent {
  recipient: string
  payload: any
  type?: string
  name?: string
}

export class MQEvent {
  private readonly _routingKey: string
  private readonly _content: IContent

  constructor(routingKey: string, content: IContent) {
    this._routingKey = routingKey
    this._content = content
  }

  public validate() {
    this.validateRoutingKey()
    this.validateContent()
  }

  public getEventName() {
    return this._routingKey.split('.')[2]
  }

  public getRecipient() {
    return this._content.recipient
  }

  public getEventBody() {
    const { recipient, ...eventBody } = this._content
    return eventBody
  }

  private validateRoutingKey() {
    const [platform, product, event] = this._routingKey.split('.')
    if (!platform || !product || !event) {
      throw new Error(ErrorName.invalidRoutingKey)
    }
  }

  private validateContent() {
    const { recipient, payload } = this._content
    if (typeof recipient !== 'string' || recipient.length === 0) {
      throw new Error(ErrorName.invalidRecipient)
    }
    if (typeof payload === 'undefined') {
      throw new Error(ErrorName.invalidPayload)
    }
  }
}
