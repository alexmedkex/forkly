export enum ErrorName {
  invalidJWTToken = 'InvalidJWTToken',
  invalidSub = 'InvalidSub',
  userIsNotLoggedIn = 'UserIsNotLoggedIn',
  invalidRoutingKey = 'InvalidRoutingKey',
  invalidEventContent = 'InvalidEventContent',
  invalidRecipient = 'InvalidRecipient',
  invalidType = 'InvalidType',
  invalidPayload = 'InvalidPayload',
  createMQListenerFailed = 'CreateMQListenerFailed',
  unexpectedMessageHandlerError = 'UnexpectedMessageHandlerError'
}
