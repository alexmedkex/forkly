import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'

import { IEthPubKeyAgent } from '../../data-layer/data-agents/IEthPubKeyAgent'
import { NewEthPubKey } from '../../data-layer/models/NewEthPubKey'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ITransactionSigner } from '../transaction-signer/ITransactionSigner'

import { IEthPubKeyUseCase } from './IEthPubKeyUseCase'

@injectable()
export default class EthPubKeyUseCase implements IEthPubKeyUseCase {
  private logger = getLogger('EthPubKeyUseCase')
  constructor(
    @inject(TYPES.EthPubKeyAgent) private ethPubKeyAgent: IEthPubKeyAgent | any,
    @inject(TYPES.TransactionSigner) private transactionSigner: ITransactionSigner | any
  ) {}

  async addEthPubKey(companyEnsDomain: string, ethPubKey: NewEthPubKey): Promise<string> {
    this.logger.info('adding Eth public key', { companyEnsDomain, ethPubKey })
    const transactionData = await this.ethPubKeyAgent.getAddEthPubKeyTxData(companyEnsDomain, ethPubKey)
    const txData = await this.transactionSigner.sendTransaction({
      to: transactionData.contractAddress,
      data: transactionData.payload
    })
    this.logger.info('added eth public key', { companyEnsDomain, transactionHash: txData.transactionHash })
    return txData.transactionHash
  }

  async revokeEthPubKey(companyEnsDomain: string, ethPubKeyIndex: number): Promise<string> {
    this.logger.info('revoking eth public key', { companyEnsDomain, ethPubKeyIndex })
    const transactionData = await this.ethPubKeyAgent.getRevokeEthPubKeyTxData(companyEnsDomain, ethPubKeyIndex)
    const txData = await this.transactionSigner.sendTransaction({
      to: transactionData.contractAddress,
      data: transactionData.payload
    })
    this.logger.info('revoked eth public key', {
      companyEnsDomain,
      ethPubKeyIndex,
      transactionHash: txData.transactionHash
    })
    return txData.transactionHash
  }
}
