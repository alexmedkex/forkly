import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import CompanyKeyProvider from '../../business-layer/key-management/CompanyKeyProvider'
import { IETHKeyData } from '../../business-layer/key-management/models/IETHKeyData'
import TransactionManager from '../../business-layer/transactions/TransactionManager'
import { isPrivateTx } from '../../business-layer/transactions/utils'
import Web3Utils from '../../business-layer/transactions/Web3Utils'
import TransactionDataAgent from '../../data-layer/data-agents/TransactionDataAgent'
import { ITransaction } from '../../data-layer/models/transaction'
import { TYPES } from '../../inversify/types'
import { INJECTED_VALUES } from '../../inversify/values'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'

import IService from './IService'
import PollingServiceFactory from './PollingServiceFactory'

@injectable()
export default class TransactionSendService implements IService {
  private readonly logger = getLogger('TransactionSendService')
  private readonly asyncPolling: IService

  constructor(
    @inject(INJECTED_VALUES.TxRetryIntervalMs) retryInterval: number,
    @inject(TYPES.PollingServiceFactory) pollingFactory: PollingServiceFactory,
    @inject(TYPES.TransactionDataAgent) private readonly transactionDataAgent: TransactionDataAgent,
    @inject(TYPES.CompanyKeyProvider) private readonly companyKeyProvider: CompanyKeyProvider,
    @inject(TYPES.TransactionManager) private readonly transactionManager: TransactionManager,
    @inject(TYPES.Web3Utils) private readonly web3Utils: Web3Utils
  ) {
    this.asyncPolling = pollingFactory.createPolling(async end => {
      await this.verifyUnconfirmedTransactions()
      end()
    }, retryInterval)
  }

  public async start() {
    this.logger.info('Starting the TransactionSendService')
    this.asyncPolling.start()
  }

  public async stop() {
    this.logger.info('Stopping the TransactionSendService')
    this.asyncPolling.stop()
  }

  /**
   * Fetches all unconfirmed transactions (according to us) and tries
   * to find it in a block. If it can't be found in a block, re-send the tx.
   *
   * If it's included in a block but our local state is as NOT confirmed, mark it as confirmed and mined
   */
  private async verifyUnconfirmedTransactions() {
    this.logger.debug('Verifying unconfirmed txs')

    let keyData: IETHKeyData
    keyData = await this.companyKeyProvider.getETHKey()

    if (!keyData) {
      this.logger.warn(
        ErrorCode.DatabaseMissingData,
        ErrorName.NoETHKeyData,
        'Unable to retrieve ETH key data, retrying'
      )
      return
    }

    const memberAccount = keyData.address
    const privateKey = keyData.privateKey

    try {
      const unconfirmedTxs = await this.transactionDataAgent.getPendingTransactions()
      await this.verifyTransactions(unconfirmedTxs, privateKey)
    } catch (error) {
      this.logger.warn(
        ErrorCode.BlockchainTransaction,
        ErrorName.VerifyUnconfirmedTxsFailed,
        'Couldnt verify transactions. Trying again later...',
        {
          message: error.message,
          account: memberAccount
        }
      )
    }
  }

  /**
   * Checks all unconfirmed transactions and tries to resend them if they are not already confirmed
   */
  private async verifyTransactions(unconfirmedTxs: ITransaction[], privateKey: string) {
    this.logger.debug('Processing unconfirmed transactions', { txNum: unconfirmedTxs.length })

    // Make sure we send the txs with lowest nonce first
    unconfirmedTxs.sort((a, b) => (a.nonce && b.nonce ? a.nonce - b.nonce : 1))

    for (const tx of unconfirmedTxs) {
      this.logger.info('Processing tx', { txId: tx.id, attempts: tx.attempts })

      // tx.hash might be undefined if we just posted the transaction
      // and have not received the tx hash value
      const isInBlock = await this.web3Utils.isTxInBlock(tx.hash)
      if (!isInBlock) {
        await this.sendTx(tx, privateKey)
      } else {
        const receipt = await this.web3Utils.getTxReceipt(tx.hash)

        // If receipt is null, the tx is still being processed by the blockchain
        // it will be updated eventually
        if (receipt) {
          this.logger.info('Receipt received', {
            action: ACTIONS.SEND_TX,
            txId: tx.id,
            receipt
          })
          // If the status is equivalent to false (0, false, 0x0), the tx reverted
          // If the status is equivalent to true (1, true, 0x1), the tx is confirmed
          receipt.status
            ? await this.transactionManager.onTransactionSuccess(tx, receipt)
            : await this.transactionManager.onRevertError(tx, receipt, 'Transaction was reverted')
        }
      }
    }
  }

  private async sendTx(tx: ITransaction, privateKey: string) {
    this.logger.info('Sending tx', { action: ACTIONS.SEND_TX, txId: tx.id })
    try {
      await this.sendTxCall(tx, privateKey)
    } catch (error) {
      this.logger.error(ErrorCode.BlockchainTransaction, ErrorName.PostTxFailed, 'Failed to send tx', {
        action: ACTIONS.SEND_TX,
        message: error.message,
        txId: tx.id
      })
    }
  }

  private async sendTxCall(tx: ITransaction, privateKey: string): Promise<void> {
    if (isPrivateTx(tx.body)) {
      await this.transactionManager.sendPrivateTx(tx)
      return
    }

    await this.transactionManager.sendPublicTx(tx, privateKey)
  }
}
