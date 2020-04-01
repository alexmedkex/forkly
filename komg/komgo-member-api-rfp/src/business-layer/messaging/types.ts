export interface IRFPActionMessage<T extends IActionPayload> {
  version: number
  context: any
  messageType: string
  data: T
}

export interface IActionPayload {
  rfp: IRFPData
}

export interface IRequestPayload extends IActionPayload {
  productRequest: any
  documentIds?: string[]
}

export interface IResponsePayload extends IActionPayload {
  response: any
}

export interface ICancelPayload extends IActionPayload {}

export interface IRFPData {
  actionId: string
  rfpId: string
  recipientStaticID: string
  senderStaticID: string
  sentAt: string
}
