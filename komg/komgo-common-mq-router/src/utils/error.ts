export enum ErrorName {
  NullMessage = 'NullMessage',
  InvalidHeaders = 'InvalidHeaders',
  InvalidRecipient = 'InvalidRecipient',
  InvalidExchange = 'InvalidExchange',
  InvalidPublish = 'InvalidPublish',
  InvalidLastMessage = 'InvalidLastMessage',
  UnexpectedSetupError = 'UnexpectedSetupError',
  CommonMQHealthCheck = 'CommonMQHealthCheck'
}

export const ErrorMessage = {
  NullMessage: 'Message is null - previous consumer was cancelled',
  InvalidHeaders: 'Invalid message without required fields or headers',
  InvalidRecipient: 'Invalid recipient MNID',
  InvalidExchange: 'Invalid recipient - exchange does not exist',
  InvalidPublish: 'Error while publishing message',
  InvalidLastMessage: 'Last message was faulty, rejecting it...'
}
