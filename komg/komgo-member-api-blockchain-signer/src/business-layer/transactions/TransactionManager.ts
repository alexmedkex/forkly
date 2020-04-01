import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'
import Web3 from 'web3'
import { PromiEvent, TransactionReceipt } from 'web3-core'

import TransactionDataAgent from '../../data-layer/data-agents/TransactionDataAgent'
import { ITransaction } from '../../data-layer/models/transaction'
import { TransactionStatus } from '../../data-layer/models/transaction/TransactionStatus'
import { TYPES } from '../../inversify/types'
import { INJECTED_VALUES } from '../../inversify/values'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'
import { Metric, TransactionType } from '../../utils/Metrics'

import MessagingClient from './MessagingClient'
import { IRawTx } from './models'
import { isPrivateTx, transactionTypeFor, signPublicTx } from './utils'
import Web3Utils from './Web3Utils'
/**
 * Manages transactions execution
 *
 * It uses the following algorithm to execute transactions:
 *
 * It will try to send a transaction to the blockchain node. Four outcomes are possible:
 * 1) Success - Persists the tx hash and the receipt in database
 * 2) Error - Tx doesn't reach the blockchain node: We reject and do nothing as we expect the tx to be retried
 * 3) Error - Tx reaches the blockchain but fails with no transaction hash: We set the tx as failed as it will never succeed
 * 4) Error - Tx reaches the blockchain but fails (reverts): we set the tx as failed
 * On error cases 3) and 4), we send an AMQP error message to notify the calling MS
 */
@injectable()
export default class TransactionManager {
  private readonly logger = getLogger('TransactionManager')

  constructor(
    @inject(TYPES.Web3Utils) private readonly web3Utils: Web3Utils,
    @inject(INJECTED_VALUES.Web3Instance) private readonly web3: Web3,
    @inject(TYPES.TransactionDataAgent) private readonly transactionDataAgent: TransactionDataAgent,
    @inject(TYPES.MessagingClient) private readonly messagingClient: MessagingClient,
    @inject(INJECTED_VALUES.MaxTransactionAttempts) private readonly maxAttempts: number
  ) {}

  /**
   * Signs and broadcasts a private tx to the network.
   *
   * @param rawTransaction Raw transaction to sign and post to the blockchain
   * @param privateKey Account's ETH private key
   */
  public async sendPrivateTx(tx: ITransaction) {
    try {
      const updatedTx = await this.transactionDataAgent.incrementTransactionAttempts(tx.id)
      await this.web3Utils.unlockAccount(tx.from)

      // Send transaction asynchronously
      const promiEvent = this.sendUnsignedTransaction(updatedTx)
      await this.processPromiEvent(updatedTx, promiEvent)
    } catch (error) {
      throw error
    }
  }

  /**
   * Signs and broadcasts a public tx to the network.
   *
   * @param rawTransaction Raw transaction to sign and post to the blockchain
   * @param privateKey Account's ETH private key
   */
  public async sendPublicTx(tx: ITransaction, privateKey: string) {
    let updatedTx: ITransaction
    try {
      // update tx, and get updated tx with incremented 'tx.attempts'
      updatedTx = await this.transactionDataAgent.updateTransactionNonceAndAttempts(tx)
    } catch (error) {
      await this.resetNonce(tx)
      throw error
    }

    try {
      // Sign public transaction
      this.logger.info('Signing public tx', { body: updatedTx.body, nonce: updatedTx.nonce })
      const signedTx = signPublicTx(updatedTx.body, updatedTx.nonce, privateKey)

      // Send transaction asynchronously
      const promiEvent = this.sendSignedTransaction(signedTx.serializedTx)
      await this.processPromiEvent(updatedTx, promiEvent)
    } catch (error) {
      throw error
    }
  }

  /**
   * Persists a raw transaction
   *
   * @param rawTransaction Raw transaction to persist
   */
  // TODO: this method is outside the scope of this class. Move dependencies to use data agent instead
  public async persistNewTx(
    rawTransaction: IRawTx,
    id?: string,
    requestOrigin?: string,
    context?: object
  ): Promise<ITransaction> {
    const tx = await this.transactionDataAgent.addNewTransaction(rawTransaction, id, requestOrigin, context)
    this.logger.info('New transaction persisted', { txId: tx.id })

    return tx
  }

  public async onTransactionSuccess(tx: ITransaction, receipt: TransactionReceipt): Promise<void> {
    this.logger.info('Tx successfully executed', {
      action: ACTIONS.SEND_TX,
      txId: tx.id,
      requestOrigin: tx.requestOrigin,
      txHash: tx.hash,
      [Metric.TransactionType]: transactionTypeFor(tx.body),
      [Metric.TransactionState]: TransactionStatus.Confirmed
    })

    await this.executeAndLog(tx, async () => {
      // If message sending failed we should not update tx status and retry later
      await this.messagingClient.publishSuccessMessage(tx)
      await this.transactionDataAgent.updateTransactionOnReceipt(tx.id, receipt)
    })
  }

  public async onRevertError(tx: ITransaction, receipt: TransactionReceipt, errorMsg: string) {
    this.logger.warn(ErrorCode.BlockchainTransaction, ErrorName.SendTxReverted, 'Reverted tx', {
      action: ACTIONS.SEND_TX,
      message: errorMsg,
      txId: tx.id,
      requestOrigin: tx.requestOrigin,
      txHash: tx.hash,
      [Metric.TransactionType]: transactionTypeFor(tx.body),
      [Metric.TransactionState]: TransactionStatus.Reverted
    })

    await this.executeAndLog(tx, async () => {
      await this.messagingClient.publishErrorMessage(tx, errorMsg, TransactionStatus.Reverted)
      // If message sending failed we should not update tx status and retry later
      await this.transactionDataAgent.updateTransactionOnReceipt(tx.id, receipt)
    })
  }

  private sendUnsignedTransaction(tx: ITransaction): PromiEvent<TransactionReceipt> {
    const txWithoutData = { ...tx.body, data: '[redacted]' }
    this.logger.info('Sending unsigned transaction', {
      tx: { ...txWithoutData },
      [Metric.TransactionType]: TransactionType.Private,
      [Metric.TransactionState]: TransactionStatus.Pending
    })

    return this.web3.eth.sendTransaction(tx.body)
  }

  private sendSignedTransaction(signedTx: string): PromiEvent<TransactionReceipt> {
    this.logger.info({
      [Metric.TransactionType]: TransactionType.Public,
      [Metric.TransactionState]: TransactionStatus.Pending
    })

    // All calls are asynchronous
    return this.web3.eth.sendSignedTransaction('0x' + signedTx)
  }

  /**
   *
   * @param tx
   * @param promiEvent
   *
   * @returns txHash - string
   */
  private async processPromiEvent(tx: ITransaction, promiEvent: PromiEvent<TransactionReceipt>) {
    return new Promise(resolve => {
      promiEvent
        .once('transactionHash', hash => {
          this.onTransactionHash(tx, hash)
          tx.hash = hash

          resolve(hash)
        })
        .once('receipt', async receipt => {
          await this.onReceiptEvent(tx, receipt)
        })
        .on('error', async error => {
          await this.onError(tx, error.message)
          resolve(error)
        })
    })
  }

  private onTransactionHash(tx: ITransaction, txHash: string) {
    this.logger.info('Transaction hash received', {
      txId: tx.id,
      txHash,
      [Metric.TransactionType]: transactionTypeFor(tx.body),
      [Metric.TransactionState]: TransactionStatus.Pending
    })

    // Save correct transaction hash
    this.transactionDataAgent.updateTransactionHash(tx.id, txHash)
  }

  private async onReceiptEvent(tx: ITransaction, receipt: TransactionReceipt): Promise<void> {
    this.logger.info('Receipt received', {
      txId: tx.id,
      receipt
    })

    return receipt.status
      ? this.onTransactionSuccess(tx, receipt)
      : this.onRevertError(tx, receipt, 'Transaction has reached gas limit')
  }

  private async executeAndLog(tx: ITransaction, updateTxState: () => Promise<void>): Promise<void> {
    try {
      await updateTxState()
    } catch (e) {
      this.logger.error(
        ErrorCode.BlockchainTransaction,
        ErrorName.UpdateTxStateFailed,
        'Failed to update transaction status',
        {
          action: ACTIONS.SEND_TX,
          txId: tx.id,
          requestOrigin: tx.requestOrigin,
          [Metric.TransactionType]: transactionTypeFor(tx.body)
        }
      )
    }
  }

  private async resetNonce(tx: ITransaction) {
    try {
      const networkNonce = await this.web3.eth.getTransactionCount(tx.from)
      if (networkNonce) {
        await this.transactionDataAgent.newNonceForAddress(tx, networkNonce)
      }
    } catch (nonceErr) {
      this.logger.error(ErrorCode.BlockchainConnection, ErrorName.EthResetNonceFail, 'Failed to reset nonce', {
        message: nonceErr.message
      })
    }
  }

  private async onError(tx: ITransaction, errorMsg: string) {
    let warningStr = 'Tx Warning'

    if (errorMsg.includes('Known transaction')) {
      warningStr = 'Node already has this tx'
    } else if (errorMsg === 'Returned error: nonce too low') {
      warningStr = errorMsg

      // Red flags here!
      // Either keys are compromised and used by another client,
      // node is out of sync (unlikely) or our logic is incorrect
      await this.resetNonce(tx)

      this.logger.warn(ErrorCode.BlockchainTransaction, ErrorName.Web3Error, warningStr, {
        action: ACTIONS.SEND_TX,
        message: errorMsg,
        txId: tx.id,
        attempt: tx.attempts,
        maxAttempts: this.maxAttempts,
        requestOrigin: tx.requestOrigin,
        [Metric.TransactionType]: transactionTypeFor(tx.body)
        // DO NOT SET [Metric.TransactionState]
        // we can't know if it really failed or not, assume nothing about the state
      })
    }
  }
}
