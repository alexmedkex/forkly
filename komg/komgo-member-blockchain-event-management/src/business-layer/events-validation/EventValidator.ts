import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'
import { Log } from 'web3-core'

import { ContractAddressDataAgent, IContractLibraryDataAgent } from '../../data-layer/data-agents'
import { ContractNotFoundError } from '../../data-layer/data-agents/errors'
import { ContractAddressStatus } from '../../data-layer/models/contract-address'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../util/ErrorName'
import { Metric, Action, Validation } from '../../util/Metrics'

import BytecodeVerifier from './BytecodeVerifier'
import ContractCastVerifier from './ContractCastVerifier'

@injectable()
export default class EventValidator {
  private readonly logger = getLogger('EventValidator')

  constructor(
    @inject(TYPES.ContractAddressDataAgent) private readonly contractAddressDataAgent: ContractAddressDataAgent,
    @inject(TYPES.ContractLibraryDataAgent) private readonly contractLibraryDataAgent: IContractLibraryDataAgent,
    @inject(TYPES.ContractCastVerifier) private readonly contractCastVerifier: ContractCastVerifier,
    @inject(TYPES.BytecodeVerifier) private readonly bytecodeVerifier: BytecodeVerifier
  ) {}

  /**
   * Validates an event
   *
   * @param log Log of event to be validated
   *
   * @returns valid boolean log is from valid contract or not
   */
  public async validate(log: Log): Promise<boolean> {
    this.logger.info('Validating event', {
      address: log.address,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      topic: log.topics[0]
    })

    const currentStatus = await this.contractAddressDataAgent.getStatus(log.address)

    if (currentStatus === ContractAddressStatus.Blacklisted) {
      this.logWarn(ErrorName.BlacklistedContract, log.address, log.transactionHash)
      return false
    } else if (currentStatus === ContractAddressStatus.Whitelisted) {
      return this.validateWhitelisted(log)
    } else {
      return this.validateUnknown(log)
    }
  }

  /**
   * Validates an event from an already whitelisted contract
   */
  private async validateWhitelisted(log: Log) {
    this.logger.info('Event emitted from whitelisted contract')

    const address = log.address
    const txHash = log.transactionHash
    const isValid = await this.isValidContractCast(log, true)

    if (!isValid) {
      this.logWarn(ErrorName.NonConformingContract, address, txHash)
      await this.contractAddressDataAgent.blacklist(address, txHash)
      this.logger.metric({
        [Metric.Action]: Action.Blacklisted,
        [Metric.Address]: address,
        [Metric.Validation]: Validation.InvalidEventEmitted
      })
    }

    return isValid
  }

  /**
   * Validates the unknon contract by checking that the event is either a valid contract cast or contract creation
   */
  private async validateUnknown(log: Log) {
    this.logger.info('Event emitted from unknown contract')

    const address = log.address
    const txHash = log.transactionHash

    // If the contract is unknown, the first event can be a cast or a contract creation event
    // otherwise, it is invalid.
    const isValidContractCast = await this.isValidContractCast(log, false)
    const isValidContractCreation = await this.isValidContractCreation(log)
    const isValid = isValidContractCast || isValidContractCreation

    // We whitelist when we encounter a contract creation event
    // We blacklist when we encounter an event that is neither contract creation nor contract cast
    if (isValidContractCreation) {
      this.logger.info('Whitelisting contract', { address })
      await this.contractAddressDataAgent.whitelist(address, txHash)
      this.logger.metric({
        [Metric.Address]: address,
        [Metric.Action]: Action.Whitelisted
      })
    } else if (!isValid) {
      this.logWarn(ErrorName.NonConformingContract, address, txHash)
      await this.contractAddressDataAgent.blacklist(address, txHash)
      this.logger.metric({
        [Metric.Address]: address,
        [Metric.Action]: Action.Blacklisted,
        [Metric.Validation]: Validation.InvalidEventEmitted
      })
    }

    return isValid
  }

  /**
   * Verifies that the event is a valid contract cast event
   *
   * @param log log to verify
   * @param defaultReturn default value to return if the event is not a contract cast event
   * @returns true if the event is a valid contract cast event, the default return value otherwise
   */
  private async isValidContractCast(log: Log, defaultReturn: boolean) {
    const isContractCast = await this.isContractCast(log.topics[0] as string)

    if (isContractCast) {
      this.logger.info('Contract cast event found', {
        contractAddress: log.address,
        topics: log.topics,
        txHash: log.transactionHash
      })

      return this.contractCastVerifier.verify(log)
    }

    return defaultReturn
  }

  private async isContractCast(topic: string) {
    const castEventHash = await this.contractLibraryDataAgent.getCastEventSigHash()
    return topic === castEventHash
  }

  /**
   * Verifies that the event is a valid contract creation event
   *
   * @param log log to verify
   * @returns true if the event is a valid contract creation event, false otherwise
   */
  private async isValidContractCreation(log: Log) {
    const isContractCreation = await this.isContractCreation(log.topics[0] as string)

    if (isContractCreation) {
      this.logger.info('Contract creation event found', {
        contractAddress: log.address,
        topics: log.topics,
        txHash: log.transactionHash
      })

      try {
        return await this.bytecodeVerifier.verifyContractCreation(log.transactionHash)
      } catch (error) {
        if (error instanceof ContractNotFoundError) {
          this.logWarn(ErrorName.ContractNotFound, log.address, log.transactionHash)
          this.logger.metric({
            [Metric.Validation]: Validation.BytecodeNotRecognised,
            [Metric.Address]: log.address
          })
          return false
        }

        throw error
      }
    }

    this.logger.metric({
      [Metric.Validation]: Validation.BytecodeVersionNotActivated,
      [Metric.Address]: log.address
    })
    return false
  }

  private async isContractCreation(topic: string) {
    return this.contractLibraryDataAgent.isExistingCreateEventSigHash(topic)
  }

  private logWarn(errorName: ErrorName, address: string, txHash: string) {
    this.logger.warn(ErrorCode.BlockchainEventValidation, errorName, {
      address,
      txHash
    })
  }
}
