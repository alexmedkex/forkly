import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'
import Web3 from 'web3'
import { TransactionReceipt } from 'web3-core'

import { INJECTED_VALUES } from '../../inversify/values'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'
import RetryableError from '../../utils/RetryableError'
import { WithRetries, getOrElseBackoffStrategy } from '../../utils/WithRetries/WithRetries'

import { IRawPrivateTx, IRawTx } from './models'

// WithRetries functions on the context of web3 communication
// as per: https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/util/backoff/ExponentialBackOff.html
// max time spent in backoff: 2000 + 3000 + 4500 + 6750 + 10125 + 15187 + 22780 + 30000 = 94342ms
export const BLOCKCHAIN_BACKOFF_STRATEGY = getOrElseBackoffStrategy('BLOCKCHAIN_BACKOFF_STRATEGY', [
  2000,
  3000,
  4500,
  6750,
  10125,
  15187,
  22780,
  30000
])
export const MAX_RETRY = BLOCKCHAIN_BACKOFF_STRATEGY.length

export enum WEB3_ERROR_MESSAGES {
  ContractCodeStorageGasLimit = "The contract code couldn't be stored, please check your gas limit.",
  InvalidJsonRPC = 'Invalid JSON RPC response: ""',
  RateLimit = 'Returned error: Rate limit',
  NodeTemporarilyUnavailable = 'Returned error: Node Temporarily Unavailable',
  FailedToCheckForReceipt = 'Failed to check for transaction receipt:\n{}',
  NonceTooLow = 'Returned error: nonce too low',
  AccountAlreadyExists = 'Returned error: account already exists'
}

export const onWeb3Error = <T extends Error>(err: T) => {
  // always retry RetryableErrors
  if (err instanceof RetryableError) {
    return true
  }
  // otherwise analyse the error message if we should retry or not
  switch (err.message) {
    // all exceptions that we SHOULD retry from this point bellow
    case WEB3_ERROR_MESSAGES.ContractCodeStorageGasLimit:
    case WEB3_ERROR_MESSAGES.InvalidJsonRPC:
    case WEB3_ERROR_MESSAGES.RateLimit:
    case WEB3_ERROR_MESSAGES.NodeTemporarilyUnavailable:
    case WEB3_ERROR_MESSAGES.FailedToCheckForReceipt:
      return true
    // all exceptions that we should NOT retry from this point bellow
    case WEB3_ERROR_MESSAGES.NonceTooLow:
    case WEB3_ERROR_MESSAGES.AccountAlreadyExists:
    default:
      return false
  }
}

@injectable()
export default class Web3Utils {
  private readonly logger = getLogger('OneTimeSigner')

  constructor(
    @inject(INJECTED_VALUES.Web3Instance) private readonly web3: Web3,
    @inject(INJECTED_VALUES.TxGasLimit) private readonly txGasLimit
  ) {}

  @WithRetries(MAX_RETRY, BLOCKCHAIN_BACKOFF_STRATEGY, onWeb3Error)
  public async getAccounts() {
    return this.web3.eth.getAccounts()
  }

  @WithRetries(MAX_RETRY, BLOCKCHAIN_BACKOFF_STRATEGY, onWeb3Error)
  public async importRawKey(privateKey: string, passphrase: string) {
    return this.web3.eth.personal.importRawKey(privateKey, passphrase)
  }

  @WithRetries(MAX_RETRY, BLOCKCHAIN_BACKOFF_STRATEGY, onWeb3Error)
  public async unlockAccount(account: string) {
    this.logger.info('Unlocking account', { account })
    try {
      await this.web3.eth.personal.unlockAccount(account, process.env.PASSPHRASE, 600)
    } catch (error) {
      this.logger.warn(ErrorCode.Configuration, ErrorName.UnlockAccountFailed, 'Unable to unlock account', {
        action: ACTIONS.UNLOCK_ACCOUNT,
        message: error.message,
        account
      })
      throw error
    }
  }

  /**
   * Builds a raw transaction by retrieving the gas limit of the latest block
   *
   * @param from member account ETH address
   * @param to destination ETH address
   * @param data Encoded ABI data
   * @param value (optional) Amount of ETH to send
   * @param gas (optional) Amount of gas to supply
   */
  public async buildRawTx(from: string, to: string, data: string, value?: string, gas?: number): Promise<IRawTx> {
    if (gas === undefined) {
      gas = this.txGasLimit
    }
    const rawTransaction: IRawTx = {
      from,
      to,
      value,
      gas,
      gasPrice: '0x0',
      data
    }

    if (!this.web3.utils.isAddress(from)) {
      throw new Error(`Incorrect address for field [from]: ${from}`)
    }

    // [to] can be undefined for deploying private contracts
    if (to && !this.web3.utils.isAddress(to)) {
      throw new Error(`Incorrect address for field [to]: ${to}`)
    }

    this.logger.info('Built raw public transaction', { transaction: { ...rawTransaction, data: '[redacted]' } })
    return rawTransaction
  }

  /**
   * Builds a raw private transaction by retrieving the gas limit of the latest block
   *
   * @param from member account ETH address
   * @param data Encoded ABI data
   */
  public async buildRawPrivateTx(
    from: string,
    to: string,
    data: string,
    privateFor: string[],
    value?: string,
    gas?: number
  ): Promise<IRawPrivateTx> {
    const baseTx = await this.buildRawTx(from, to, data, value, gas)
    const rawPrivateTx: IRawPrivateTx = {
      ...baseTx,
      // Always force nonce to be zero in private transactions
      // When reusing same one-time key, node will throw Returned error: nonce too low
      // This way we ensure one-time keys are not reusable
      nonce: 0,
      privateFor
    }

    this.logger.info('Built raw private transaction', { transaction: { ...rawPrivateTx, data: '[redacted]' } })
    return rawPrivateTx
  }

  /**
   * Gets the receipt of a transaction
   *
   * @param txHash Transaction hash
   */
  public getTxReceipt(txHash: string): Promise<TransactionReceipt> {
    this.logger.info('Getting transaction receipt', { txHash })
    return this.web3.eth.getTransactionReceipt(txHash)
  }

  /**
   * Checks that a transaction has been added to a block (is mined)
   *
   * @param txHash Transaction hash to check
   */
  public async isTxInBlock(txHash: string) {
    if (!txHash) {
      return false
    }

    this.logger.info('Checking transaction exists in blockchain', { txHash })
    const tx = await this.web3.eth.getTransaction(txHash)

    // If tx is null: it's not being processed
    // If tx is not null: it is either still being processed or confirmed
    // If tx.blockNumber is null: transaction can be in the queue and not yet assigned in a block.
    //    In this case, blockHash will be 0x000000000000000000000 and blockNumber will be null
    // If tx.blockNumber is not null: transaction is in block
    return !!tx && !!tx.blockNumber
  }

  public async recoverReceiptOnError(
    txHash: string,
    error: Error
  ): Promise<{ receiptError: Error; receipt: TransactionReceipt }> {
    if (!txHash) {
      throw new Error('Unable to retrieve transaction receipt: no transaction hash')
    }
    let receiptError
    const receipt = await this.recoverReceipt(txHash).catch(() => undefined)
    if (!receipt) {
      this.logger.info(`Failed getting transaction receipt for ${txHash}: ${error.message}`, error)
      receiptError = Error('Failed getting transaction receipt: ' + error.message)
    }
    return { receiptError, receipt }
  }

  @WithRetries(MAX_RETRY, BLOCKCHAIN_BACKOFF_STRATEGY)
  public async recoverReceipt(txHash) {
    this.logger.info(`Attempting to recover receipt for transaction hash: ${txHash}`)
    const receipt = await this.web3.eth.getTransactionReceipt(txHash)
    if (receipt) {
      return receipt
    } else {
      throw new Error('[internal] Transaction was not mined yet')
    }
  }

  public isReceiptRecoverable(error: Error): boolean {
    switch (error.message) {
      case WEB3_ERROR_MESSAGES.InvalidJsonRPC:
      case WEB3_ERROR_MESSAGES.RateLimit:
      case WEB3_ERROR_MESSAGES.NodeTemporarilyUnavailable:
      case WEB3_ERROR_MESSAGES.FailedToCheckForReceipt:
        return true
      case WEB3_ERROR_MESSAGES.NonceTooLow:
      case WEB3_ERROR_MESSAGES.ContractCodeStorageGasLimit:
      default:
        return false
    }
  }
}
