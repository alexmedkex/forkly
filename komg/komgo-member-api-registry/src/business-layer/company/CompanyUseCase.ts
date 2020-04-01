import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'
import 'reflect-metadata'
import Web3 from 'web3'

import { ICompanyDataAgent } from '../../data-layer/data-agents/ICompanyDataAgent'
import Company from '../../data-layer/models/Company'
import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ITransactionSigner } from '../transaction-signer/ITransactionSigner'

import ICompanyUseCase from './ICompanyUseCase'

@injectable()
export default class CompanyUseCase implements ICompanyUseCase {
  private logger = getLogger('CompanyUseCase')
  constructor(
    @inject(TYPES.CompanyDataAgent) private companyDataAgent: ICompanyDataAgent | any,
    @inject(TYPES.TransactionSigner) private transactionSigner: ITransactionSigner | any,
    @inject(TYPES.Web3) private web3Instance: Web3 | any
  ) {}

  async createCompany(company: Company): Promise<string> {
    const companyLabelHash = await this.web3Instance.sha3(company.getLabel)
    this.logger.info('Creating company', { ...company, companyLableHash: companyLabelHash })
    const payloadData = await this.companyDataAgent.getCreateCompanyData(companyLabelHash, company.getCompanyAddress)
    const txData = await this.transactionSigner.sendTransaction({
      data: payloadData.payload,
      to: payloadData.contractAddress
    })
    this.logger.info('Company created', { ...company, transaction: txData.transactionHash })
    // TODO { tx: "0x3r3r43refafaefafd" }
    return txData.transactionHash
  }
}
