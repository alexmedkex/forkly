import { Contract } from '../common/Contract'
import { inject } from 'inversify'
import { TYPES } from '../../inversify/types'
import { IWeb3Instance } from '@komgo/blockchain-access'
import SmartContracts from '@komgo/smart-contracts'
import { LCAmendmentAction } from './LCAmendmentActionType'

export class LCAmendmentContract extends Contract<LCAmendmentAction> {
  constructor(@inject(TYPES.Web3Instance) web3Instance: IWeb3Instance | any) {
    super(web3Instance, SmartContracts.LCAmendment.ABI)
  }

  setupFunctionEncoders() {
    this.functionEncoders.set(LCAmendmentAction.approveIssuingBank, this.contractReference.methods.approveIssuingBank)
    this.functionEncoders.set(LCAmendmentAction.rejectIssuingBank, this.contractReference.methods.rejectIssuingBank)
  }
}
