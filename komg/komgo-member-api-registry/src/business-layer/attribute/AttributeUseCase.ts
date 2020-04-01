import { injectable } from 'inversify'
import 'reflect-metadata'

import { IAttributeDataAgent } from '../../data-layer/data-agents/IAttributeDataAgent'
import Attribute from '../../data-layer/models/Attribute'
import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ITransactionSigner } from '../transaction-signer/ITransactionSigner'

import IAttributeUseCase from './IAttributeUseCase'

@injectable()
export default class AttributeUseCase implements IAttributeUseCase {
  constructor(
    @inject(TYPES.AttributeDataAgent) private attributeDataAgent: IAttributeDataAgent | any,
    @inject(TYPES.TransactionSigner) private transactionSigner: ITransactionSigner | any
  ) {}

  async addAttribute(companyEnsDomain: string, attribute: Attribute): Promise<string> {
    const payloadData = await this.attributeDataAgent.getAddAttributeData(companyEnsDomain, attribute)
    const txData = await this.transactionSigner.sendTransaction({
      data: payloadData.payload,
      to: payloadData.contractAddress
    })
    return txData.transactionHash
  }
}
