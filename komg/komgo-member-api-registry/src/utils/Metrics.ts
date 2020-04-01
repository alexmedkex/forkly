import { requestStorageInstance } from '@komgo/microservice-config'

export enum AttributeControllerEndpoints {
  AddAttribute = 'addAttribute'
}

export enum CompanyControllerEndpoints {
  CreateCompany = 'createCompany'
}

export enum EthPubKeyControllerEndpoints {
  AddEthPubKey = 'addEthPubKey',
  RevokeEthPubKey = 'revokeEthPubKey'
}

export enum HealthControllerEndpoints {
  Healthz = 'healthz',
  Ready = 'ready'
}

export enum RegistryCacheControllerEndpoints {
  Populate = 'populate',
  StartCacheEventService = 'startCacheEventService',
  GetLastProcessedEvent = 'getLastProcessedEvent',
  GetMembers = 'getMembers',
  Clear = 'clear',
  GetProductAvailability = 'getProductAvailability'
}

export enum Metric {
  FlowMessageReceived = 'flowMessageReceived',
  FlowMessageProcessed = 'flowMessageProcessed',
  APICallReceived = 'apiCallReceived',
  APICallFinished = 'apiCallFinished',
  Error = 'error',
  CachePopulationState = 'CachePopulationState'
}
