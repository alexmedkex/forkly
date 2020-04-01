export enum ErrorName {
  CompanyNotFound = 'CompanyNotFound',
  CounterpartyNotFound = 'CounterpartyNotFound',
  CounterpartyRequestNotFound = 'CounterpartyRequestNotFound',
  CounterpartyAlreadyAdded = 'CounterpartyAlreadyAdded',
  CounterpartyAlreadyRejected = 'CounterpartyAlreadyRejected',
  CounterpartyAlreadyExist = 'CounterpartyAlreadyExist',
  CounterpartyRequestApprove = 'CounterpartyRequestApprove',
  CounterpartyInvalidStatus = 'CounterpartyInvalidStatus',
  CounterpartyRequestAlreadyExist = 'CounterpartyRequestAlreadyExist',
  CounterpartyRequestApproveFailed = 'CounterpartyRequestApproveFailed',
  CounterpartyAlreadyPending = 'CounterpartyAlreadyPending',
  CounterpartySelfAddFailed = 'CounterpartySelfAddFailed',
  HttpRegistryApiFailed = 'HttpRegistryApiFailed',
  ConnectToInternalMQFailed = 'ConnectToInternalMQFailed',
  ClosingConnectionToInternalMqFailed = 'ClosingConnectionToInternalMqFailed',
  InternalMQBufferIsFullFailed = 'InternalMQBufferIsFullFailed',
  ReceiveMsgInternalMQFailed = 'ReceiveMsgInternalMQFailed',
  ParseQueryStringFailed = 'ParseQueryStringFailed',
  EventProcessorNotFoundFailed = 'EventProcessorNotFoundFailed',
  ProcessingCoverageMessageFailed = 'ProcessingCoverageMessageFailed'
}