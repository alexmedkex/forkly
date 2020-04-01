import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'

import { BlockchainConnectionException } from '../../exceptions'
import { ErrorNames } from '../../exceptions/utils'
import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { TransactionData } from '../models/TransactionData'
import { IContractArtifacts } from '../smart-contracts/IContractArtifacts'

import { ICompanyDataAgent } from './ICompanyDataAgent'

@injectable()
export default class CompanyDataAgent implements ICompanyDataAgent {
  private logger = getLogger('CompanyDataAgent')
  constructor(@inject(TYPES.ContractArtifacts) private artifacts: IContractArtifacts | any) {}

  public async getCreateCompanyData(companyLabelHash: string, companyAddress: string): Promise<TransactionData> {
    const registrarInstance = await this.artifacts.komgoRegistrar()
    let payload
    try {
      payload = await registrarInstance.contract.registerAndSetResolvers.getData(companyLabelHash, companyAddress)
    } catch (error) {
      this.logger.error(
        ErrorCode.BlockchainConnection,
        ErrorNames.GetCreateCompanyDataInvalidContractParameters,
        { companyLabelHash, companyAddress, error },
        new Error().stack
      )
      throw new BlockchainConnectionException('Invalid contract parameters for function RegisterAndSetResolvers()')
    }
    return new TransactionData(registrarInstance.address, payload)
  }
}
