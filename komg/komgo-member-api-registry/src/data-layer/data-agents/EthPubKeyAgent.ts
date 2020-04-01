import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'

import { BlockchainTransactionException } from '../../exceptions'
import { ErrorNames } from '../../exceptions/utils'
import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { EthPubKey } from '../models/EthPubKey'
import { NewEthPubKey } from '../models/NewEthPubKey'
import { TransactionData } from '../models/TransactionData'
import { IContractArtifacts } from '../smart-contracts/IContractArtifacts'

import { IEthPubKeyAgent } from './IEthPubKeyAgent'
const namehash = require('eth-ens-namehash')

@injectable()
export default class EthPubKeyAgent implements IEthPubKeyAgent {
  private logger = getLogger('EthPubKeyAgent')

  constructor(@inject(TYPES.ContractArtifacts) private artifacts: IContractArtifacts | any) {}

  /**
   * Get Transaction payload data to add a new Ethereum Public Key in the Resolver Contract
   * @param domain node where the eth public key is going to be added. Ex: company.komgo
   * @param ethPubKey key to be added
   */
  async getAddEthPubKeyTxData(domain: string, ethPubKey: NewEthPubKey): Promise<TransactionData> {
    const node = namehash.hash(domain)
    const resolverInstance = await this.artifacts.resolverForNode(node)
    let payload
    try {
      payload = await resolverInstance.contract.addEthereumPublicKey.getData(
        node,
        ethPubKey.publicKeyLow,
        ethPubKey.publicKeyHigh,
        ethPubKey.terminationDate
      )
    } catch (error) {
      this.logger.error(
        ErrorCode.BlockchainTransaction,
        ErrorNames.GetAddEthPubKeyTxDataInvalidContractParameters,
        error.message,
        {
          node,
          publicKeyLow: ethPubKey.publicKeyLow,
          publicKeyHigh: ethPubKey.publicKeyHigh,
          terminationDate: ethPubKey.terminationDate
        },
        new Error().stack
      )
      throw new BlockchainTransactionException('Invalid contract parameters for function addEthereumPublicKey()')
    }
    return new TransactionData(resolverInstance.address, payload)
  }

  /**
   * Get Transaction payload data to revoke the Ethereum Public Key in the Resolver Contract
   * @param domain node domain. Ex: company.komgo
   * @param ethPubKeyIndex index of the eth public key to be revoked
   */
  async getRevokeEthPubKeyTxData(domain: string, ethPubKeyIndex: number): Promise<TransactionData> {
    const node = namehash.hash(domain)
    const resolverInstance = await this.artifacts.resolverForNode(node)
    let payload
    try {
      payload = await resolverInstance.contract.revokeEthereumPublicKey.getData(node, ethPubKeyIndex)
    } catch (error) {
      this.logger.error(
        ErrorCode.BlockchainTransaction,
        ErrorNames.GetRevokeEthPubKeyTxDataInvalidContractParameters,
        error.message,
        { node, ethPubKeyIndex },
        new Error().stack
      )
      throw new BlockchainTransactionException('Invalid contract parameters for function revokeEthereumPublicKey()')
    }
    return new TransactionData(resolverInstance.address, payload)
  }

  /**
   * Get an ethereum public key based on the index
   * @param domain node domain. Ex: company.komgo
   * @param ethPubKeyIndex index of the ethereum public key
   */
  async getEthPubKey(domain: string, ethPubKeyIndex: number): Promise<EthPubKey> {
    const node = namehash.hash(domain)
    const resolver = await this.artifacts.resolverForNode(node)
    const currentEthPubKey = await resolver.currentEthereumPublicKey(node, ethPubKeyIndex)
    return new EthPubKey(
      currentEthPubKey[0],
      currentEthPubKey[1],
      currentEthPubKey[2],
      currentEthPubKey[3],
      currentEthPubKey[4]
    )
  }
}
