export interface IRsaEncryptedPayload {
  payload: string
}

export interface IDecryptedEnvelope {
  error: boolean
  message: any
}

export interface IJSONPublicKey {
  kty: string
  kid: string
  e: string
  n: string
}

export interface IEncryptedEnvelope {
  message: string
}

export interface ISendMessageResponse {
  routed: boolean
}

export type IVhostsResponse = Array<{}>

export interface ICommonMessageProperties {
  messageId?: string
  correlationId?: string

  senderMnid?: string
  senderStaticId?: string
  senderPlatform?: string

  recipientMnid?: string
  recipientStaticId?: string
  recipientPlatform?: string
}

export interface IPlatformSpecificMessageProperties {
  recipientExchange?: string
  pubKeys?: any
  pubKeyProperty: string
  mnidProperty: string
  recipientEntry: any
  recipientPlatform: string
  commonMessageProperties: ICommonMessageProperties
  isRecipientMember?: boolean
}

export class MessageProcessingError extends Error {
  constructor(m: string) {
    super(m)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MessageProcessingError.prototype)
  }
}
