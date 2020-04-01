import { Platform } from './Platform'
import { IRsaEncryptedPayload, ICommonMessageProperties, MessageProcessingError } from './types'

export default class CommonMessageReceived {
  constructor(
    readonly routingKey: string,
    readonly message: IRsaEncryptedPayload,
    readonly properties: ICommonMessageProperties
  ) {}

  getSenderPlatform(): Platform {
    if (this.properties.senderPlatform && this.properties.senderPlatform.length > 0) {
      const senderPlatform = this.properties.senderPlatform.toLocaleLowerCase()
      switch (senderPlatform) {
        case Platform.VAKT:
          return Platform.VAKT
        case Platform.KOMGO:
          return Platform.KOMGO
        default:
          throw new MessageProcessingError(`Platform '${senderPlatform}' is not supported`)
      }
    }
    return this.routingKey.toLocaleLowerCase().indexOf('komgo') >= 0 ? Platform.KOMGO : Platform.VAKT
  }
}
