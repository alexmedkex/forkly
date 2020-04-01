export enum Metric {
  MessageDirection = 'messageDirection',
  RFPMessageType = 'RFPMessageType',
  UpdateMessageType = 'UpdateMessageType',
  MessageType = 'MessageType',
  TradeCargoType = 'TradeCargoType',
  MessageStatus = 'messageStatus',
  FailureType = 'failureType',
  ReplyType = 'replyType',
  RDStatus = 'RDStatus',
  RDSummariesNumber = 'RDSummariesNumber',
  ParticipantSummariesInfo = 'participantSummariesInfo',
  DocumentReceived = 'DocumentReceived',
  AddDiscountingRequestReceived = 'AddDiscountingRequestReceived'
}

export enum FailureType {
  MicroserviceInvalidResponseData = 'microserviceInvalidResponseData',
  InvalidMessagePayload = 'invalidMessagePayload',
  UnsupportedRoutingKey = 'unsupportedRoutingKey',
  ValidationFailure = 'ValidationFailure'
}

export enum MessageDirection {
  Inbound = 'inbound',
  Outbound = 'outbound'
}

export enum MessageStatus {
  Success = 'success',
  Failed = 'failed'
}
