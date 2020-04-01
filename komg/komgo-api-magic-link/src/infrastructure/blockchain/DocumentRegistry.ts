import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'

import { TYPES } from '../../inversify/types'

import { ISmartContractProvider, IDocumentRegistrySmartContract, IDocumentRegistrationInfo } from './interfaces'

/**
 * This class is used for verification of documents registered before DocumentRegistryV2
 */
@injectable()
export class DocumentRegistry {
  private readonly logger = getLogger('DocumentRegistry')
  private truffleContract: IDocumentRegistrySmartContract

  constructor(
    @inject(TYPES.SmartContractProvider)
    private readonly smcProvider: ISmartContractProvider,
    @inject(TYPES.DocumentRegistryDomain) private readonly documentRegistryDomain: string
  ) {}

  public async getTruffleContract(): Promise<IDocumentRegistrySmartContract> {
    if (!this.truffleContract) {
      this.truffleContract = await this.smcProvider.getTruffleContract<IDocumentRegistrySmartContract>(
        this.documentRegistryDomain
      )
    }

    return this.truffleContract
  }

  /**
   * Uses document registry smartcontract to look up document by hash
   */
  public async findDocument(docHash: string): Promise<IDocumentRegistrationInfo | undefined> {
    const truffleContract = await this.getTruffleContract()
    try {
      const data = await truffleContract.getRegistrationInfo(docHash)
      return {
        companyStaticId: data[0],
        timestamp: parseInt(data[1], 10) * 1000
      }
    } catch (e) {
      this.logger.info(`Document with hash ${docHash} not found in the document registry`, {
        msg: e.message
      })
    }
  }
}
