import { injectable } from 'inversify'

import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import Attribute from '../models/Attribute'
import { TransactionData } from '../models/TransactionData'
import { IContractArtifacts } from '../smart-contracts/IContractArtifacts'

import { IAttributeDataAgent } from './IAttributeDataAgent'

const namehash = require('eth-ens-namehash')

@injectable()
export default class AttributeDataAgent implements IAttributeDataAgent {
  constructor(@inject(TYPES.ContractArtifacts) private artifacts: IContractArtifacts | any) {}

  public async getAddAttributeData(companyEnsDomain: string, attribute: Attribute): Promise<TransactionData> {
    const node = namehash.hash(companyEnsDomain)
    const resolverInstance = await this.artifacts.resolverForNode(node)
    const payload = await resolverInstance.contract.setText.getData(node, attribute.getKey, attribute.getValue)
    return new TransactionData(resolverInstance.address, payload)
  }
}
