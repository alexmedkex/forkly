import { ILC } from '../../data-layer/models/ILC'
import { IVaktMessage, ILCPayload, LCMessageType, IHeadersType } from './messageTypes'

export interface IVaktMessageBuilder<T> {
  set(options: T): IVaktMessage<ILCPayload & T>
}

export class VaktMessageBuilder<T> implements IVaktMessageBuilder<T> {
  // headers
  recipientStaticId: string
  // payload
  version: number = 1
  vaktId: string

  constructor(lc: ILC, options: IHeadersType) {
    this.recipientStaticId = options.recipientStaticId

    this.vaktId = lc.tradeAndCargoSnapshot.sourceId
  }

  set(options: T): IVaktMessage<ILCPayload & T> {
    const payload: ILCPayload = {
      version: this.version,
      vaktId: this.vaktId
    }
    const newPayload = { ...payload, ...(options as any) }
    return {
      headers: {
        recipientStaticId: this.recipientStaticId
      },
      payload: newPayload
    }
  }
}
