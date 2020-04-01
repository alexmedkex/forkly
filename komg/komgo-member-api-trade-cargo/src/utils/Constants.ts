export enum ErrorName {
  CargoNotFound = 'CargoNotFound',
  TradeNotFound = 'TradeNotFound',
  TradeForCargoNotFound = 'TradeForCargoNotFound',
  InvalidCargoData = 'InvalidCargoData',
  InvalidTradeData = 'InvalidTradeData',
  InvalidCargoSource = 'InvalidCargoSource',
  ConnectInternalMQFailed = 'ConnectInternalMQFailed',
  CargoValidationFailed = 'CargoValidationFailed',
  TradeValidationFailed = 'TradeValidationFailed',
  AsyncPollingFailed = 'AsyncPollingFailed',
  ClosingConnectionInternalMQFailed = 'ClosingConnectionInternalMQFailed',
  InternalMQEventFailed = 'InternalMQEventFailed',
  MessageProcessingFailed = 'MessageProcessingFailed',
  StopServiceFailed = 'StopServiceFailed',
  HttpRequestFailed = 'HttpRequestFailed',
  CargoRequiredConstraintFailed = 'CargoRequiredConstraintFailed'
}
