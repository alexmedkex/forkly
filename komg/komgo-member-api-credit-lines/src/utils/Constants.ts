export enum ErrorName {
  UnexpectedError = 'UnexpectedError',
  CreditLineInvalidData = 'CreditLineInvalidData',
  DisclosedCreditLineInvalidData = 'DisclosedCreditLineInvalidData',
  MissingCreditLineDataForStaticId = 'MissingCreditLineDataForStaticId',
  MissingSharedCreditLineDataForStaticId = 'MissingCreditLineDataForStaticId',
  MissingDisclosedCreditLineDataForStaticId = 'MissingDisclosedCreditLineDataForStaticId',
  MissingCreditLineRequestForStaticId = 'MissingCreditLineRequestForStaticId',
  HttpRequestFailed = 'HttpRequestFailed',
  EventProcessorNotFoundFailed = 'EventProcessorNotFoundFailed',
  ReceiveMsgInternalMQFailed = 'ReceiveMsgInternalMQFailed',
  InternalMQBufferIsFullFailed = 'InternalMQBufferIsFullFailed',
  UnsupportedMessageTypeError = 'UnsupportedMessageTypeError',
  MessageProcessFailed = 'MessageProcessFailed',
  InvalidMessagePayloadError = 'InvalidMessagePayloadError',
  SendMQMessageFailed = 'SendMQMessageFailed',
  NoticationRoleNotFound = 'NoticationRoleNotFound',
  NotificationError = 'NotificationError',
  CreditLineCreateFailed = 'CreditLineCreateFailed',
  CreditLineUpdateFailed = 'CreaditLineUpdateFailed',
  SharedCLCreateFailed = 'SharedCLCreateFailed',
  SharedCLUpdateFailed = 'SharedCLCreateFailed',
  SharedCLProcessFailed = 'SharedCLProcessFailed',
  CreditLineRequestInvalidData = 'CreditLineRequestInvalidData',
  InvalidNotificationContext = 'InvalidNotificationContext',

  MissingDepositLoanDataForStaticId = 'MissingDepositLoanDataForStaticId',
  DepositLoanInvalidData = 'DepositLoanInvalidData',
  DepositLoanCreateFailed = 'DepositLoanCreateFailed',
  DepositLoanUpdateFailed = 'DepositLoanUpdateFailed',
  SharedDepositLoanCreateFailed = 'SharedDepositLoanCreateFailed',
  SharedDepositLoanUpdateFailed = 'SharedDepositLoanUpdateFailed',
  MissingDepositLoanRequestDataForStaticId = 'MissingDepositLoanRequestDataForStaticId',
  DepositLoanRequestInvalidData = 'DepositLoanRequestInvalidData'
}