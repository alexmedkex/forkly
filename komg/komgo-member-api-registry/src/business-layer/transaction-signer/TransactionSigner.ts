import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'
import Web3 from 'web3'

import { TransactionSignResult } from '../../data-layer/models/TransactionSignResult'
import { generateBlockchainException, ErrorNames } from '../../exceptions/utils'
import { TYPES } from '../../inversify/types'

import { ITransactionSigner } from './ITransactionSigner'

@injectable()
export default class TransactionSigner implements ITransactionSigner {
  private logger = getLogger('TransactionSigner')
  constructor(@inject(TYPES.Web3) private web3Instance: Web3 | any) {}

  async sendTransaction(tx: any): Promise<TransactionSignResult> {
    let txResult

    try {
      const fromAccounts = await this.web3Instance.eth.getAccounts()

      tx = {
        ...tx,
        from: fromAccounts[0],
        gas: 1000000
      }

      txResult = await this.web3Instance.eth.sendTransaction(tx)
    } catch (error) {
      throw generateBlockchainException(error, ErrorNames.SendTransactionFailed, new Error().stack, this.logger, { tx })
    }

    return Promise.resolve(new TransactionSignResult(txResult.transactionHash))
  }
}
