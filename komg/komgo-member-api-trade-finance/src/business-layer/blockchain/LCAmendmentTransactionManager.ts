import { ILCAmendment } from '@komgo/types'
import SmartContractInfo from '@komgo/smart-contracts'
import { inject, injectable } from 'inversify'
import { ILC } from '../../data-layer/models/ILC'
import { TYPES } from '../../inversify/types'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { ILCAmendmentTransactionManager } from './ILCAmendmentTransactionManager'
import { ISignature } from '../common/ISignature'
import { LCAmendmentAction } from './LCAmendmentActionType'
import { LCAmendmentContract } from './LCAmendmentContract'
import { TransactionManagerBase } from '../common/TransactionManagerBase'
import { CONFIG } from '../../inversify/config'
import { ISignerClient } from '../common/ISignerClient'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { BlockchainTransactionException } from '../../exceptions'

@injectable()
export class LCAmendmentTransactionManager extends TransactionManagerBase<LCAmendmentContract, LCAmendmentAction>
  implements ILCAmendmentTransactionManager {
  constructor(
    @inject(TYPES.SignerClient) signer: ISignerClient | any,
    @inject(CONFIG.RegistryContractAddress) ensAddress: string,
    @inject(CONFIG.CompanyStaticId) companyStaticId: string,
    @inject(TYPES.CompanyRegistryService)
    companyService: ICompanyRegistryService,
    @inject(TYPES.LCAmendmentContract) contract: LCAmendmentContract
  ) {
    super(signer, ensAddress, companyStaticId, companyService, contract, SmartContractInfo.LCAmendment.ByteCode)
  }

  public async deployInitial(lc: ILC, amendment: ILCAmendment, parties: string[]) {
    const encodedAmendment = JSON.stringify(amendment)

    let contractArguments
    let signature: ISignature
    let from

    this.logger.info('getting key and signature data', {
      encodedAmendment
    })

    from = (await this.signer.getKey()).data
    signature = await this.getSignatureData(encodedAmendment, from)

    if (!signature) {
      this.logger.error(
        ErrorCode.BlockchainTransaction,
        ErrorNames.EmptySignatureError,
        'Signature is empty',
        {
          from,
          signature,
          encodedAmendment
        },
        new Error().stack
      )
      throw new BlockchainTransactionException('Signature is empty')
    }

    contractArguments = [encodedAmendment, lc.contractAddress, this.ensAddress, signature.v, signature.r, signature.s]
    return super.deployContract(contractArguments, parties, from)
  }

  public async approveByIssuingBank(
    contractAddress: string,
    parties: string[],
    documentHash: string,
    documentReference: string
  ) {
    this.logger.info('approving by issuing bank', {
      contractAddress
    })

    const partiesWithoutMe = this.removeMyselfFromParties(parties)
    const encodedData = await this.getTransactionEncodedData(
      contractAddress,
      LCAmendmentAction.approveIssuingBank,
      documentHash,
      documentReference
    )
    const postResult = await this.sendData(encodedData, contractAddress, partiesWithoutMe)
    return postResult.data
  }

  public async rejectByIssuingBank(contractAddress: string, parties: string[], comments: string) {
    this.logger.info('rejecting by issuing bank', {
      contractAddress
    })

    const partiesWithoutMe = this.removeMyselfFromParties(parties)
    const encodedData = await this.getTransactionEncodedData(
      contractAddress,
      LCAmendmentAction.rejectIssuingBank,
      comments
    )

    const postResult = await this.sendData(encodedData, contractAddress, partiesWithoutMe)
    return postResult.data
  }
}
