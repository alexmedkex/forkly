import { ErrorCode } from '@komgo/error-utilities'
import logger, { getLogger } from '@komgo/logging'
import { ObjectId } from 'bson'
import { injectable } from 'inversify'
import { TransactionReceipt } from 'web3-core'

import { IRawTx } from '../../business-layer/transactions/models'
import { ErrorName } from '../../middleware/common/Constants'
import { Metric } from '../../utils/Metrics'
import { MONGODB_DUPLICATE_ERROR } from '../constants/mongo'
import { INonce } from '../models/nonce/INonce'
import { Nonce } from '../models/nonce/Nonce'
import { Transaction, ITransaction } from '../models/transaction'
import { TransactionStatus } from '../models/transaction/TransactionStatus'

/**
 * TransactionDataAgent Class: contains all Key object related methods
 * @export
 * @class TransactionDataAgent
 */
@injectable()
export default class TransactionDataAgent {
  private readonly logger = getLogger('TransactionDataAgent')

  async getTransaction(id: string): Promise<ITransaction> {
    if (!ObjectId.isValid(id)) return null

    return Transaction.findById(id)
  }

  async addNewTransaction(body: IRawTx, id?: string, requestOrigin?: string, context?: object): Promise<ITransaction> {
    try {
      return await this.doAddNewTransaction(body, id, requestOrigin, context)
    } catch (e) {
      return this.processNewTxException(id, e)
    }
  }

  /**
   * Updates Nonce counter and updates transaction with the correct nonce.
   * Nonce will always keep counter as the next valid nonce.
   *
   * Writing on Multiple documents (Nonce & Transaction) requires us to double
   * check the sequential nature of the nonce increments (always +1 of previous highest nonce)
   *
   * @param tx
   * @param networkNonce
   *
   * @returns transaction with an updated nonce. If the transaction was already assigned a nonce, return it as is.
   * Otherwise increment nonce counter and update transaction atomically
   */
  async updateTransactionNonceAndAttempts(tx: ITransaction): Promise<ITransaction> {
    // retrieve transaction from the database ONLY IF it has a nonce already attributed
    let result: ITransaction = await Transaction.findOne({ _id: tx.id, nonce: { $exists: true } }).exec()
    if (result) {
      return result
    }

    // retrieve a valid nonce for this transaction
    // nonce is kept in mongodb and we keep it sequencially by get and increment atomically.
    let nonce: number
    try {
      nonce = await this.getAndIncrementNonce(tx)
    } catch (nonceErr) {
      logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorName.UpdateTxStateFailed,
        `Failed to increment nonce for tx id ${tx.id}`
      )
      throw nonceErr
    }

    // set transaction nonce with retrieved nonce
    try {
      result = await Transaction.findOneAndUpdate(
        { _id: tx.id, nonce: { $exists: false } },
        { $set: { nonce }, $inc: { attempts: 1 } },
        { new: true }
      ).exec()
    } catch (updateNonceErr) {
      throw updateNonceErr
    }

    // if by any chance the findOneAndUpdate did not find tx without nonce, throw error
    if (!result) {
      throw new Error('Could not find transaction without nonce: ' + tx.id)
    }

    return result
  }

  public async getHighestNonceTx(from: string): Promise<ITransaction> {
    return Transaction.findOne({ from, nonce: { $exists: true } })
      .sort({ nonce: -1 })
      .limit(1)
      .exec()
  }

  /**
   *
   * @param address
   */
  public async getAndIncrementNonce(tx: ITransaction): Promise<number> {
    // Locks finding and incrementing the nonce
    let result: INonce = await Nonce.findOneAndUpdate(
      {
        address: tx.from
      },
      {
        $inc: {
          nonce: 1
        }
      },
      { new: false }
    ).exec()

    // new address?
    // new nonce to 0
    if (!result) {
      result = await this.newNonceForAddress(tx, 0)
    }

    return result.nonce
  }

  /**
   *
   * @param address
   */
  public async newNonceForAddress(tx: ITransaction, nonce: number): Promise<INonce> {
    let result
    try {
      result = await Nonce.updateOne({ address: tx.from }, { $set: { nonce } }, { upsert: true, new: true }).exec()

      // we reset to null here because we want to re-input the nonce
      // when we retry to send the tx. Is not set here because other txs might
      // attempt to go through first. So assign new nonce then
      await this.newNonceForTransaction(tx, null)
    } catch (err) {
      throw err
    }

    return result
  }

  /**
   *
   */
  public async newNonceForTransaction(tx: ITransaction, nonce: number): Promise<ITransaction> {
    if (!nonce) {
      return Transaction.findOneAndUpdate({ _id: tx.id }, { $unset: { nonce: 1 } }, { new: true }).exec()
    }

    return Transaction.findOneAndUpdate({ _id: tx.id }, { $set: { nonce } }, { new: true }).exec()
  }

  /**
   *
   * @param id
   */
  async incrementTransactionAttempts(id: string): Promise<ITransaction> {
    this.logger.info('Incrementing transaction attempts', {
      id
    })
    return Transaction.findOneAndUpdate({ _id: id }, { $inc: { attempts: 1 } }, { new: true })
  }

  async updateTransactionHash(id: string, hash: string): Promise<void> {
    return Transaction.updateOne({ _id: id }, { $set: { hash } })
  }

  async updateTransactionOnReceipt(id: string, receipt: TransactionReceipt): Promise<void> {
    this.logger.info('Updating transaction on receipt', {
      id,
      receipt,
      [Metric.TransactionState]: receipt.status ? TransactionStatus.Confirmed : TransactionStatus.Reverted
    })
    return Transaction.updateOne(
      { _id: id },
      { $set: { receipt, status: receipt.status ? TransactionStatus.Confirmed : TransactionStatus.Reverted } }
    )
  }

  async getPendingTransactions(): Promise<ITransaction[]> {
    return Transaction.find({ status: TransactionStatus.Pending })
  }

  private async doAddNewTransaction(
    body: IRawTx,
    id?: string,
    requestOrigin?: string,
    context?: object
  ): Promise<ITransaction> {
    return Transaction.create({
      _id: id,
      from: body.from,
      body,
      requestOrigin,
      context
    })
  }

  private async processNewTxException(id: string, e: any) {
    if (this.isDuplicatedIdError(e)) {
      logger.info('Tries to create a transaction with the same id', {
        txId: id
      })
      return await this.getTransaction(id)
    }

    throw e
  }

  /**
   * Checks if Mongo driver threw an exception because we tried to
   * insert a transaction with an existing id
   *
   * @param e error object to check
   */
  private isDuplicatedIdError(e: any): boolean {
    return e.code === MONGODB_DUPLICATE_ERROR && e.errmsg.includes('index: _id_ dup key')
  }
}
