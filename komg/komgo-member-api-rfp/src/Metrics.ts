export enum Metric {
  MessageDirection = 'messageDirection',
  MessageType = 'messageType',
  MessageStatus = 'messageStatus',
  FailureType = 'failureType'
}

export enum MessageDirection {
  Inbound = 'inbound',
  Outbound = 'outbound'
}

export enum FailureType {
  InvalidMessageType = 'invalidMessageType',
  InvalidRecipient = 'invalidReceipient',
  OutboundPublishFailed = 'outboundPublishFailed'
}

export enum MessageStatus {
  Success = 'success',
  Failed = 'failed'
}
