import { LCPresentationContract } from './LCPresentationContract'
import { TransactionManagerBase } from '../common/TransactionManagerBase'
import SignerClient from '../common/SignerClient'
import { TYPES } from '../../inversify/types'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { inject, injectable } from 'inversify'
import { HashMetaDomain } from '../common/HashFunctions'
import { LCPresentationActionType, LCPresentationAction } from './LCPresentationActionType'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import * as _ from 'lodash'
import { ILC } from '../../data-layer/models/ILC'
import SmartContractInfo from '@komgo/smart-contracts'

import {
  ILCPresentationContractData,
  ILCPresentationContractCustomData
} from '../events/LCPresentation/ILCPresentationContractData'
import { CONFIG } from '../../inversify/config'
import { BlockchainTransactionException } from '../../exceptions'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'

const web3Utils = require('web3-utils')

export interface ILCPresentationTransactionManager {
  deployDocPresented(presentation: ILCPresentation, lc: ILC): Promise<string>
  deployCompliantAsNominatedBank(presentation: ILCPresentation, lc: ILC): Promise<string>
  deployCompliantAsIssuingBank(presentation: ILCPresentation, lc: ILC): Promise<string>
  deployAdviseDiscrepanciesAsNominatedBank(presentation: ILCPresentation, lc: ILC): Promise<string>
  deployAdviseDiscrepanciesAsIssuingBank(presentation: ILCPresentation, lc: ILC): Promise<string>

  nominatedBankSetDocumentsCompliant(contractAddress: string, presentation: ILCPresentation): Promise<string>
  nominatedBankSetDocumentsDiscrepant(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string>
  issuingBankSetDocumentsCompliant(contractAddress: string, presentation: ILCPresentation): Promise<string>
  issuingBankSetDocumentsDiscrepant(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string>

  // advising discrepancies
  nominatedBankAdviseDiscrepancies(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string>
  issungBankAdviseDiscrepancies(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string>

  // accept/reject discrepancies
  issuingBankSetDiscrepanciesAccepted(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string>
  issuingBankSetDiscrepanciesRejected(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string>
  applicantSetDiscrepanciesAccepted(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string>
  applicantSetDiscrepanciesRejected(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string>
}

@injectable()
export class LCPresentationTransactionManager
  extends TransactionManagerBase<LCPresentationContract, LCPresentationActionType>
  implements ILCPresentationTransactionManager {
  protected loggerName = 'LCPresentationTransactionManager'

  constructor(
    @inject(TYPES.SignerClient) signer: SignerClient,
    @inject(CONFIG.RegistryContractAddress) ensAddress: string,
    @inject(CONFIG.CompanyStaticId) companyStaticId: string,
    @inject(TYPES.CompanyRegistryService) companyService: ICompanyRegistryService,
    @inject(TYPES.LCPresentationContract) contract: LCPresentationContract
  ) {
    super(signer, ensAddress, companyStaticId, companyService, contract, SmartContractInfo.LCPresentation.ByteCode)
  }

  deployDocPresented(presentation: ILCPresentation, lc: ILC): Promise<string> {
    const parties: string[] = [
      presentation.beneficiaryId,
      presentation.nominatedBankId || presentation.issuingBankId // available with
    ]

    this.logger.info('Deploying LC presentation contract - Doc Presented', {
      LCPresentationReference: presentation.reference,
      id: presentation.staticId
    })
    return this.deploy(presentation, lc, parties)
  }

  deployCompliantAsNominatedBank(presentation: ILCPresentation, lc: ILC): Promise<string> {
    const parties: string[] = [presentation.beneficiaryId, presentation.nominatedBankId, presentation.issuingBankId]

    this.logger.info('Deploying LC presentation contract as nominated bank', {
      LCPresentationReference: presentation.reference,
      id: presentation.staticId
    })

    return this.deploy(presentation, lc, parties)
  }

  deployCompliantAsIssuingBank(presentation: ILCPresentation, lc: ILC): Promise<string> {
    const parties: string[] = [
      presentation.beneficiaryId,
      presentation.nominatedBankId,
      presentation.issuingBankId,
      presentation.applicantId
    ].filter(party => !!party)

    this.logger.info('Deploying LC presentation contract as issuing bank', {
      LCPresentationReference: presentation.reference,
      id: presentation.staticId
    })

    return this.deploy(presentation, lc, parties)
  }

  deployAdviseDiscrepanciesAsNominatedBank(presentation: ILCPresentation, lc: ILC): Promise<string> {
    const parties: string[] = [presentation.beneficiaryId, presentation.issuingBankId, presentation.applicantId]

    this.logger.info('Deploying LC presentation contract for advising discrepancies as nominated bank', {
      LCPresentationReference: presentation.reference,
      id: presentation.staticId
    })

    return this.deploy(presentation, lc, parties, true)
  }

  deployAdviseDiscrepanciesAsIssuingBank(presentation: ILCPresentation, lc: ILC): Promise<string> {
    const parties: string[] = [presentation.beneficiaryId, presentation.applicantId]

    this.logger.info('Deploying LC presentation contract for advising discrepancies as issuing bank', {
      LCPresentationReference: presentation.reference,
      id: presentation.staticId
    })

    return this.deploy(presentation, lc, parties, true)
  }

  async nominatedBankSetDocumentsCompliant(contractAddress: string, presentation: ILCPresentation): Promise<string> {
    return this.callPresentationAction(contractAddress, LCPresentationAction.nominatedBankSetDocumentsCompliant, [
      presentation.beneficiaryId
    ])
  }

  async nominatedBankSetDocumentsDiscrepant(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string> {
    return this.callPresentationAction(
      contractAddress,
      LCPresentationAction.nominatedBankSetDocumentsDiscrepant,
      [presentation.beneficiaryId],
      comments
    )
  }

  async issuingBankSetDocumentsCompliant(contractAddress: string, presentation: ILCPresentation): Promise<string> {
    return this.callPresentationAction(contractAddress, LCPresentationAction.issuingBankSetDocumentsCompliant, [
      presentation.beneficiaryId,
      presentation.nominatedBankId
    ])
  }

  async issuingBankSetDocumentsDiscrepant(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string> {
    return this.callPresentationAction(
      contractAddress,
      LCPresentationAction.issuingBankSetDocumentsDiscrepant,
      [presentation.beneficiaryId, presentation.nominatedBankId],
      comments
    )
  }

  async nominatedBankAdviseDiscrepancies(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string> {
    return this.callPresentationAction(
      contractAddress,
      LCPresentationAction.nominatedBankAdviseDiscrepancies,
      [presentation.beneficiaryId],
      comments
    )
  }

  async issungBankAdviseDiscrepancies(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string> {
    return this.callPresentationAction(
      contractAddress,
      LCPresentationAction.issungBankAdviseDiscrepancies,
      [presentation.beneficiaryId],
      comments
    )
  }

  async issuingBankSetDiscrepanciesAccepted(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string> {
    return this.callPresentationAction(
      contractAddress,
      LCPresentationAction.issuingBankSetDiscrepanciesAccepted,
      [presentation.beneficiaryId, presentation.nominatedBankId, presentation.applicantId],
      comments
    )
  }
  async issuingBankSetDiscrepanciesRejected(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string> {
    return this.callPresentationAction(
      contractAddress,
      LCPresentationAction.issuingBankSetDiscrepanciesRejected,
      [presentation.beneficiaryId, presentation.nominatedBankId, presentation.applicantId],
      comments
    )
  }

  async applicantSetDiscrepanciesAccepted(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string> {
    return this.callPresentationAction(
      contractAddress,
      LCPresentationAction.applicantSetDiscrepanciesAccepted,
      [presentation.beneficiaryId, presentation.nominatedBankId, presentation.issuingBankId],
      comments
    )
  }
  async applicantSetDiscrepanciesRejected(
    contractAddress: string,
    presentation: ILCPresentation,
    comments: string
  ): Promise<string> {
    return this.callPresentationAction(
      contractAddress,
      LCPresentationAction.applicantSetDiscrepanciesRejected,
      [presentation.beneficiaryId, presentation.nominatedBankId, presentation.issuingBankId],
      comments
    )
  }

  private async deploy(presentation: ILCPresentation, lc: ILC, parties: string[], isAdvisingDiscrepancies = false) {
    let contractArguments
    let from

    this.logger.info('deploying LCPresentation contract...', {
      presentationId: presentation && presentation.staticId,
      lcId: lc && lc._id ? lc._id.toString() : null
    })

    const NOMINATED_BANK = this.getNominatedBank(presentation)

    const presentationData = this.getContractData(presentation, lc)
    from = (await this.signer.getKey()).data

    const signature = await this.getSignatureData(presentationData.jsonData, from)

    this.checkSignature(presentation, lc, signature)

    const documents = _.map(_.groupBy(presentation.documents, d => d.documentTypeId), (value, docType) => ({
      documentType: web3Utils.asciiToHex(docType),
      documentHashes: JSON.stringify(_.map(value, doc => doc.documentHash))
    }))

    try {
      contractArguments = [
        NOMINATED_BANK,
        documents,
        presentationData,
        isAdvisingDiscrepancies,
        this.ensAddress,
        signature.v,
        signature.r,
        signature.s
      ]

      return super.deployContract(contractArguments, parties, from)
    } catch (err) {
      this.logger.error('Error deploying LCPresentation contract', {
        presentationId: presentation ? presentation.staticId : null,
        lcId: lc && lc._id ? lc._id : null,
        errorObject: err,
        errorMesssage: err ? err.message : null
      })
      throw err
    }
  }

  private checkSignature(signature, presentation, lc) {
    if (!signature) {
      this.logger.error(
        ErrorCode.BlockchainTransaction,
        ErrorNames.LCPresentationCheckSignatureFailed,
        "Can't get signature data params.",
        {
          presentationId: presentation && presentation._id ? presentation._id : null,
          lcId: lc && lc._id ? lc._id : null
        },
        new Error().stack
      )

      throw new BlockchainTransactionException("Can't get signature data params")
    }
  }

  private getNominatedBank(presentation) {
    return presentation.nominatedBankId ? HashMetaDomain(presentation.nominatedBankId) : '0x0'
  }

  private async callPresentationAction(
    contractAddress: string,
    action: LCPresentationActionType,
    parties: string[],
    comments?: string
  ): Promise<string> {
    let postResult
    parties = parties.filter(p => !!p) // clean nulls

    try {
      const encodedData = await this.getTransactionEncodedData(contractAddress, action, comments || '')
      postResult = await this.sendData(encodedData, contractAddress, parties.map(HashMetaDomain))
    } catch (error) {
      this.logger.info(`${action}() failed: ${error.message}`, { contractAddress })
      throw error
    }
    return postResult.data
  }

  private getContractData(presentation: ILCPresentation, lc: ILC): ILCPresentationContractData {
    const customData: ILCPresentationContractCustomData = {
      staticId: presentation.staticId,
      lcPresentationReference: presentation.reference,
      lcReference: presentation.LCReference
    }

    return {
      jsonData: JSON.stringify(customData),
      lcAddress: lc.contractAddress,
      beneficiaryComments: presentation.beneficiaryComments || '',
      nominatedBankComments: presentation.nominatedBankComments || '',
      issuingBankComments: presentation.issuingBankComments || '',
      ...customData
    }
  }
}
