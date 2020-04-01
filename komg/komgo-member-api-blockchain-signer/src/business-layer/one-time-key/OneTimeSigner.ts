import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { Wallet } from 'ethers'
import { inject, injectable } from 'inversify'
import Web3 from 'web3'
import { TransactionReceipt } from 'web3-core'

import AddrIndexDataAgent from '../../data-layer/data-agents/AddrIndexDataAgent'
import { TransactionStatus } from '../../data-layer/models/transaction/TransactionStatus'
import VaultClient from '../../infrastructure/vault/VaultClient'
import { TYPES } from '../../inversify/types'
import { INJECTED_VALUES } from '../../inversify/values'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'
import { IPostPrivateTransaction, VAULT_MNEMONIC_PATH } from '../../service-layer/request/one-time-signer'
import { Metric, TransactionType } from '../../utils/Metrics'
import { WithRetries } from '../../utils/WithRetries/WithRetries'
import { IRawPrivateTx } from '../transactions/models'
import Web3Utils, { BLOCKCHAIN_BACKOFF_STRATEGY, onWeb3Error, MAX_RETRY } from '../transactions/Web3Utils'

@injectable()
export default class OneTimeSigner {
  private readonly logger = getLogger('OneTimeSigner')

  /**
   *
   * @param web3
   * @param web3Utils
   * @param addrIndexDataAgent
   * @param vaultClient
   * @param mnemonic - DEPRECATED. Mnemonic value should be used through vault
   */
  constructor(
    @inject(INJECTED_VALUES.Web3Instance) private readonly web3: Web3,
    @inject(TYPES.Web3Utils) private readonly web3Utils: Web3Utils,
    @inject(TYPES.AddrIndexDataAgent) private readonly addrIndexDataAgent: AddrIndexDataAgent,
    @inject(TYPES.VaultClient) private readonly vaultClient: VaultClient,
    @inject(INJECTED_VALUES.Mnemonic) public mnemonic: string
  ) {}

  /**
   * Generates a new ETH key by increasing the index of the wallet path
   */
  public async generateOnetimeKey() {
    this.logger.info('Generating one-time key')

    if (this.vaultClient.isAvailable()) {
      try {
        const response = await this.vaultClient.readKVSecret(VAULT_MNEMONIC_PATH)
        this.mnemonic = response.data.mnemonic
      } catch (error) {
        this.logger.error(
          ErrorCode.ConnectionVault,
          ErrorName.VaultReadKVFailed,
          'failed to retrieve mnemonic from vault',
          {
            errorMessage: error.message
          }
        )
      }
    }

    if (!this.mnemonic) {
      throw new Error('missing mnemonic')
    }

    this.logger.info('Getting a new wallet/account')
    const wallet = await this.getWallet()

    this.logger.info('Importing private key to quorum')
    const privateKeyWithout0x = wallet.privateKey.slice(2)
    const address = await this.web3Utils.importRawKey(privateKeyWithout0x, process.env.PASSPHRASE)

    this.logger.info('Address imported to quorum', {
      action: ACTIONS.GENERATE_ONE_TIME_KEY,
      address
    })
    return address
  }

  /**
   *
   */
  public mnemonicHash(): string {
    return this.web3.utils.sha3(this.mnemonic)
  }

  /**
   * Creates and posts a new private transaction to the blockchain
   *
   * @param from member account address
   * @param data encoded ABI data of the transaction
   */
  public async postTransaction(postTransaction: IPostPrivateTransaction, returnFullReceipt?: boolean) {
    this.logger.info('Posting private transaction')

    const tx = await this.web3Utils.buildRawPrivateTx(
      postTransaction.from,
      postTransaction.to,
      postTransaction.data,
      postTransaction.privateFor,
      postTransaction.value,
      postTransaction.gas
    )

    await this.web3Utils.unlockAccount(postTransaction.from)

    const receipt = await this.sendTransaction(tx)

    return returnFullReceipt ? receipt : receipt.transactionHash
  }

  @WithRetries(MAX_RETRY, BLOCKCHAIN_BACKOFF_STRATEGY, onWeb3Error)
  private async sendTransaction(tx: IRawPrivateTx) {
    return new Promise<TransactionReceipt>((resolve, reject) => {
      this.logger.info('Sending private transaction', tx)

      const txWithoutData = { ...tx, data: '[redacted]' }
      this.logger.info('sendTransaction', {
        ...txWithoutData,
        [Metric.TransactionType]: TransactionType.Private,
        [Metric.TransactionState]: TransactionStatus.Pending
      })

      let receivedTxHash: string
      this.web3.eth
        .sendTransaction(tx)
        .on('transactionHash', async txHash => {
          receivedTxHash = txHash
          this.logger.info('transaction hash received', {
            txHash,
            ...txWithoutData,
            [Metric.TransactionType]: TransactionType.Private,
            [Metric.TransactionState]: TransactionStatus.Pending
          })
        })
        .once('receipt', async receipt => {
          // handleReceipt will resolve or reject promise
          this.handleReceipt(receipt, resolve, reject)
        })
        .on('error', async error => {
          // if we have not received any transaction hash we might have not sent the transaction at all (retry if possible)
          if (!receivedTxHash) {
            this.logger.warn(
              ErrorCode.BlockchainTransaction,
              ErrorName.PostPrivateTxFailed,
              'Failed to recover transaction: no transaction hash',
              {
                errorMessage: error.message
              }
            )
            return reject(error)
          }

          // analyze error and determine if it is possible to recover the tx receipt or not
          const shouldRecoverReceipt = this.web3Utils.isReceiptRecoverable(error)
          if (shouldRecoverReceipt) {
            this.logger.info('Error while sending private transaction, attempting to recover receipt...', {
              errorMessage: error.message
            })
            const { receiptError, receipt } = await this.web3Utils.recoverReceiptOnError(receivedTxHash, error)

            // handleReceipt will resolve or reject promise
            this.handleReceipt(receipt, resolve, reject, receiptError)
          } else {
            this.logger.warn(
              ErrorCode.BlockchainTransaction,
              ErrorName.PostPrivateTxFailed,
              'Failed to send a private transaction',
              {
                ...txWithoutData,
                txHash: receivedTxHash,
                errorMessage: error.message,
                [Metric.TransactionType]: TransactionType.Private,
                [Metric.TransactionState]: TransactionStatus.Reverted
              }
            )
            reject(error)
          }
        })
    })
  }

  @WithRetries(MAX_RETRY, BLOCKCHAIN_BACKOFF_STRATEGY, onWeb3Error)
  private async getWallet() {
    while (true) {
      // get wallet path
      const mnemonicHash = this.web3.utils.sha3(this.mnemonic)
      const addressObj = await this.addrIndexDataAgent.findAndUpdateIndex(mnemonicHash)
      const walletPath = `m/44'/60'/0'/0/${addressObj.addrIndex}`
      this.logger.info('Retrieved wallet path: ' + walletPath, walletPath)

      // get account from wallet path
      const wallet = Wallet.fromMnemonic(this.mnemonic, walletPath)
      const accounts = await this.web3Utils.getAccounts()
      this.logger.info(`Retrieved ${accounts ? accounts.length : 'NaN'} accounts`)

      // make sure account is new and not used
      const accountExists = accounts.some((account: string) => account === wallet.address)
      if (accountExists) {
        // means that this accounts is already loaded in quorum node and is
        // likely that it has been used to send private transactions
        // action: simply log warning and continue to find a suitable account
        // when can happen: database gets deleted and we loose the `addrindex` collection
        this.logger.warn(ErrorCode.BlockchainTransaction, 'AccountAlreadyLoaded', { address: wallet.address })
        continue
      }
      return wallet
    }
  }

  /**
   * It is possible to receive a receipt even if the transaction failed. By checking the status we can know if it failed
   * @param receipt transaction receipt
   * @param resolve object to resolve promise
   * @param reject object to reject promise
   */
  private handleReceipt(receipt, resolve, reject, receiptError?) {
    // analyse if we have a valid receipt or if we got receipt errors
    if (!receipt) {
      if (receiptError) {
        return reject(receiptError)
      } else {
        return reject(new Error('Transaction receipt is undefined'))
      }
    }

    // analyse receipt status
    if (receipt.status) {
      this.logger.info('receipt received', {
        receipt,
        [Metric.TransactionType]: TransactionType.Private,
        [Metric.TransactionState]: TransactionStatus.Confirmed
      })
      return resolve(receipt)
    } else {
      this.logger.warn(
        ErrorCode.BlockchainTransaction,
        ErrorName.PostPrivateTxFailed,
        'receipt received with status=false',
        {
          receipt,
          [Metric.TransactionType]: TransactionType.Private,
          [Metric.TransactionState]: TransactionStatus.Failed
        }
      )
      return reject(new Error('Transaction failed with status=false'))
    }
  }
}
