import { LCPresentationAction } from './LCPresentationActionType'
import { Contract } from '../common/Contract'
import { inject } from 'inversify'
import { TYPES } from '../../inversify/types'
import { IWeb3Instance } from '@komgo/blockchain-access'
import SmartContractInfo from '@komgo/smart-contracts'

export class LCPresentationContract extends Contract<LCPresentationAction> {
  constructor(@inject(TYPES.Web3Instance) web3Instance: IWeb3Instance) {
    super(web3Instance, SmartContractInfo.LCPresentation.ABI)
  }
  setupFunctionEncoders() {
    this.functionEncoders.set(
      LCPresentationAction.nominatedBankSetDocumentsCompliant,
      this.contractReference.methods.nominatedBankSetDocumentsCompliant
    )
    this.functionEncoders.set(
      LCPresentationAction.nominatedBankSetDocumentsDiscrepant,
      this.contractReference.methods.nominatedBankSetDocumentsDiscrepant
    )
    this.functionEncoders.set(
      LCPresentationAction.issuingBankSetDocumentsCompliant,
      this.contractReference.methods.issuingBankSetDocumentsCompliant
    )
    this.functionEncoders.set(
      LCPresentationAction.issuingBankSetDocumentsDiscrepant,
      this.contractReference.methods.issuingBankSetDocumentsDiscrepant
    )

    // advising discrepancies
    this.functionEncoders.set(
      LCPresentationAction.nominatedBankAdviseDiscrepancies,
      this.contractReference.methods.nominatedBankAdviseDiscrepancies
    )

    this.functionEncoders.set(
      LCPresentationAction.issungBankAdviseDiscrepancies,
      this.contractReference.methods.issungBankAdviseDiscrepancies
    )

    this.functionEncoders.set(
      LCPresentationAction.issuingBankSetDiscrepanciesAccepted,
      this.contractReference.methods.issuingBankSetDiscrepanciesAccepted
    )

    this.functionEncoders.set(
      LCPresentationAction.issuingBankSetDiscrepanciesRejected,
      this.contractReference.methods.issuingBankSetDiscrepanciesRejected
    )

    this.functionEncoders.set(
      LCPresentationAction.applicantSetDiscrepanciesAccepted,
      this.contractReference.methods.applicantSetDiscrepanciesAccepted
    )

    this.functionEncoders.set(
      LCPresentationAction.applicantSetDiscrepanciesRejected,
      this.contractReference.methods.applicantSetDiscrepanciesRejected
    )
  }
}
