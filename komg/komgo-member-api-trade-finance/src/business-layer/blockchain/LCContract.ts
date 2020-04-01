import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { Contract } from '../common/Contract'
import { LCAction } from './LCActionType'
import { IWeb3Instance } from '@komgo/blockchain-access'
import SmartContractInfo from '@komgo/smart-contracts'
import { ILCContract } from './ILCContract'
import { injectable } from 'inversify'

@injectable()
export class LCContract extends Contract<LCAction> implements ILCContract {
  constructor(@inject(TYPES.Web3Instance) web3Instance: IWeb3Instance | any) {
    super(web3Instance, SmartContractInfo.LC.ABI)
  }

  setupFunctionEncoders() {
    this.functionEncoders.set(LCAction.request, this.contractReference.methods.request)
    this.functionEncoders.set(LCAction.issue, this.contractReference.methods.issue)
    this.functionEncoders.set(LCAction.requestReject, this.contractReference.methods.requestReject)
    this.functionEncoders.set(
      LCAction.issuedLCRejectByBeneficiary,
      this.contractReference.methods.issuedLCRejectByBeneficiary
    )
    this.functionEncoders.set(
      LCAction.issuedLCRejectByAdvisingBank,
      this.contractReference.methods.issuedLCRejectByAdvisingBank
    )
    this.functionEncoders.set(LCAction.advise, this.contractReference.methods.advise)
    this.functionEncoders.set(LCAction.acknowledge, this.contractReference.methods.acknowledge)
  }
}
