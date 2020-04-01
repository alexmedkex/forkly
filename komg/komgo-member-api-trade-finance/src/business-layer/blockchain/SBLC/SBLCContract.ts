import { inject } from '../../../inversify/ioc'
import { TYPES } from '../../../inversify/types'
import { Contract } from '../../common/Contract'
import { SBLCAction } from './SBLCActionType'
import { IWeb3Instance } from '@komgo/blockchain-access'
import SmartContractInfo from '@komgo/smart-contracts'
import { ISBLCContract } from './ISBLCContract'
import { injectable } from 'inversify'

@injectable()
export class SBLCContract extends Contract<SBLCAction> implements ISBLCContract {
  constructor(@inject(TYPES.Web3Instance) web3Instance: IWeb3Instance | any) {
    super(web3Instance, SmartContractInfo.SBLC.ABI)
  }

  setupFunctionEncoders() {
    this.functionEncoders.set(SBLCAction.issue, this.contractReference.methods.issue)
    this.functionEncoders.set(SBLCAction.requestReject, this.contractReference.methods.requestReject)
    this.functionEncoders.set(
      SBLCAction.issuedSBLCRejectByBeneficiary,
      this.contractReference.methods.issuedSBLCRejectByBeneficiary
    )
    this.functionEncoders.set(
      SBLCAction.issuedSBLCRejectByAdvisingBank,
      this.contractReference.methods.issuedSBLCRejectByAdvisingBank
    )
    this.functionEncoders.set(SBLCAction.advise, this.contractReference.methods.advise)
    this.functionEncoders.set(SBLCAction.acknowledge, this.contractReference.methods.acknowledge)
  }
}
