import { ErrorCode } from '@komgo/error-utilities'

import BlockchainConnectionException from './BlockchainConnectionException'
import BlockchainTransactionException from './BlockchainTransactionException'

export const ErrorNames = {
  BlockchainConnectionError: 'BlockchainConnectionError',
  EventValidationFailed: 'EventValidationFailed',
  ClearCacheFailed: 'ClearCacheFailed',
  SaveSingleEventFailed: 'SaveSingleEventFailed',
  GetMembersFailed: 'GetMembersFailed',
  GetCreateCompanyDataFailed: 'GetCreateCompanyDataFailed',
  GetCreateCompanyDataInvalidContractParameters: 'GetCreateCompanyDataInvalidContractParameters',
  GetAddEthPubKeyTxDataInvalidContractParameters: 'GetAddEthPubKeyTxDataInvalidContractParameters',
  GetRevokeEthPubKeyTxDataInvalidContractParameters: 'GetRevokeEthPubKeyTxDataInvalidContractParameters',
  GetLastEventProcessedFailed: 'GetLastEventProcessedFailed',
  RegistryEventProcessedDataAgentCreateOrUpdateFailed: 'RegistryEventProcessedDataAgentCreateOrUpdateFailed',
  ResolverNotFound: 'ResolverNotFound',
  LastProcessedEventNotFound: 'LastProcessedEventNotFound',
  MessageAlreadyProcessed: 'MessageAlreadyProcessed',
  EventAddressNotAllowed: 'EventAddressNotAllowed',
  PreviousEventProcessedNotFound: 'PreviousEventProcessedNotFound',
  DeployENSContractFailed: 'DeployENSContractFailed',
  DeployKomgoResolverFailed: 'DeployKomgoResolverFailed',
  DeployKomgoRegistrarFailed: 'DeployKomgoRegistrarFailed',
  DeployCompanyDataFailed: 'DeployCompanyDataFailed',
  DeployKomgoMetaResolverFailed: 'DeployKomgoMetaResolverFailed',
  DeployResolverForNodeFailed: 'DeployResolverForNodeFailed',
  Web3GetIdFailed: 'Web3GetIdFailed',
  UnexpectedError: 'UnexpectedError',
  SendTransactionFailed: 'SendTransactionFailed',
  StartEventServiceFailed: 'StartEventServiceFailed',
  PopulatingCacheError: 'PopulatingCacheError',
  KeyValidityCheckFailed: 'KeyValidityCheckFailed',
  CacheNotReadyError: 'CacheNotReadyError',
  AsyncPollingStartFailed: 'AsyncPollingStartFailed',
  ReadAndConsumeEventsFailed: 'ReadAndConsumeEventsFailed',
  CloseConsumerFailed: 'CloseConsumerFailed',
  InvalidTextChangedKey: 'InvalidTextChangedKey',
  TextChangedDataAgentFailedToSaveEvent: 'TextChangedDataAgentFailedToSaveEvent',
  ExitProcessError: 'ExitProcessError'
}

export function generateBlockchainException(error: Error, errorName: string, stacktrace, logger, context = {}) {
  if (error.message === `Invalid JSON RPC response: ""`) {
    logger.error(
      ErrorCode.BlockchainConnection,
      errorName,
      'Could not connect to blockchain.',
      {
        message: error.message,
        ...context
      },
      stacktrace
    )
    return new BlockchainConnectionException('Could not connect to blockchain.')
  } else {
    logger.error(ErrorCode.BlockchainTransaction, errorName, error.message, context, stacktrace)
    return new BlockchainTransactionException(`Error when trying to call a smart contract.`)
  }
}
