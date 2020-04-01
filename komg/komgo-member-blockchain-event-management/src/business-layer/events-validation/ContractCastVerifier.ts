import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import SmartContractInfo from '@komgo/smart-contracts'
import { injectable, inject } from 'inversify'
import Web3 from 'web3'
import { Log } from 'web3-core'

import { ContractAddressDataAgent } from '../../data-layer/data-agents'
import { ContractAddressStatus } from '../../data-layer/models/contract-address'
import { findEventABIByName, CONTRACT_CAST_EVENT_NAME } from '../../data-layer/models/light-contract-library/utils'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../util/ErrorName'
import { ContractCastVerifierError } from '../errors'

@injectable()
export default class ContractCastVerifier {
  private readonly logger = getLogger('ContractCastVerifier')

  constructor(
    @inject(TYPES.ContractAddressDataAgent) private readonly contractAddressDataAgent: ContractAddressDataAgent,
    @inject(TYPES.Web3Instance) private readonly web3: Web3
  ) {}

  /**
   * Verifies that the contract cast event references a valid smart contract
   *
   * @param log log to verify
   *
   * @returns true if contract cast is valid, false otherwise
   */
  public async verify(log: Log): Promise<boolean> {
    this.logger.info('Verifying contract cast event')

    const contractCastEventABI = findEventABIByName(CONTRACT_CAST_EVENT_NAME, SmartContractInfo.ICastEventEmitterABI)
    const decodedLogs: any = this.web3.eth.abi.decodeLog(contractCastEventABI.inputs, log.data, log.topics as string[])

    if (!decodedLogs.at) {
      this.logger.error(
        ErrorCode.BlockchainEventValidation,
        ErrorName.EventLogDecodeError,
        'Error while decoding contract cast log',
        { decodedLogs }
      )

      throw new ContractCastVerifierError()
    }

    this.logger.info('Contract cast address found', { address: decodedLogs.at })
    const status = await this.contractAddressDataAgent.getStatus(decodedLogs.at)

    return status === ContractAddressStatus.Whitelisted
  }
}
