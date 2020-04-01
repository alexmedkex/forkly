import { getLogger } from '@komgo/logging'
import { sha3 } from 'ethereumjs-util'
import { injectable, inject } from 'inversify'
import * as Web3 from 'web3'
import * as web3Utils from 'web3-utils'

import { TYPES } from '../../inversify/types'

import { ISmartContractProvider, IDocumentRegistryV1SmartContract } from './interfaces'
const leftPad = require('left-pad')
const BigNumber = require('bignumber.js')

/**
 * This class is used for verification of documents registered before DocumentRegistryV2
 */
@injectable()
export class DocumentRegistryV1 {
  private readonly logger = getLogger('DocumentRegistryV1')
  private truffleContract: IDocumentRegistryV1SmartContract

  constructor(
    @inject(TYPES.SmartContractProvider)
    private readonly smcProvider: ISmartContractProvider,
    @inject(TYPES.DocumentRegistryV1Domain) private readonly documentRegistryDomain: string,
    @inject(TYPES.Web3Instance) private readonly web3Instance: Web3
  ) {}

  public async getTruffleContract(): Promise<IDocumentRegistryV1SmartContract> {
    if (!this.truffleContract) {
      this.truffleContract = await this.smcProvider.getTruffleContract<IDocumentRegistryV1SmartContract>(
        this.documentRegistryDomain
      )
    }

    return this.truffleContract
  }

  /**
   * Returns a tuple (docId, timestamp of initial posting, latest revision hash, latest update timestamp)
   *
   * @param companyId
   * @param docId - This might be the very first hash (ID to be spec'd)
   *
   * @returns 32 byte HEX string of the most recent hash
   */
  public async getCompanyId(docId: string): Promise<string | null> {
    await this.getTruffleContract()

    const hexDocId = this.transformDocIdToHex(docId)
    let complexKeyForFirstValue
    let reverseNode
    // solidity stores mappings in memory chunks starting with 0 to infinity
    for (let chunkIndex = 1; chunkIndex < 5; chunkIndex += 1) {
      complexKeyForFirstValue = this.getComplexKey(hexDocId, chunkIndex)

      const complexKeyForThirdValue = `0x${new BigNumber(complexKeyForFirstValue).plus(1).toString(16)}`

      reverseNode = await this.web3Instance.eth.getStorageAt(this.smcProvider.contractAddress, complexKeyForThirdValue)
      if (reverseNode !== `0x${this.standardizeInput(0)}`) {
        this.logger.info('Data retrieved from DocumentRegistry contract')
        return reverseNode
      }
    }

    if (reverseNode === `0x${this.standardizeInput(0)}`) {
      return null
    }
  }

  public async getHashAndTimestamp(docId: string): Promise<[string, string]> {
    const truffleContract = await this.getTruffleContract()
    const hexDocId = this.transformDocIdToHex(docId)
    const data = await truffleContract.getDocumentHashAndOwner(hexDocId)

    this.logger.info('Data retrieved from getDocumentHashAndOwner', { data })

    return [data[2], `${parseInt(data[3], 10) * 1000}`]
  }

  private transformDocIdToHex(docId: string): string {
    const docIdHash = sha3(docId).toString('ascii')
    return web3Utils.asciiToHex(docIdHash)
  }

  private standardizeInput(input: any): string {
    const inputHex = web3Utils.toHex(input).replace('0x', '')
    return leftPad(inputHex, 64, '0')
  }

  private getComplexKey(key: string, index: string | number): string {
    return web3Utils.sha3(key + this.standardizeInput(index))
  }
}
