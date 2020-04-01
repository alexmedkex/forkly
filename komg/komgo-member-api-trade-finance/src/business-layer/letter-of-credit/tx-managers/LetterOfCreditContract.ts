import { injectable } from 'inversify'

import { IWeb3Instance } from '@komgo/blockchain-access'
import SmartContractInfo from '@komgo/smart-contracts'

import { inject } from '../../../inversify/ioc'
import { TYPES } from '../../../inversify/types'

import { Contract } from '../../common/Contract'

import { LetterOfCreditAction } from '../../letter-of-credit/tx-managers/LetterOfCreditActionType'
import { ILetterOfCreditContract } from '../../letter-of-credit/tx-managers/ILetterOfCreditContract'

@injectable()
export class LetterOfCreditContract extends Contract<LetterOfCreditAction> implements ILetterOfCreditContract {
  constructor(@inject(TYPES.Web3Instance) web3Instance: IWeb3Instance | any) {
    super(web3Instance, SmartContractInfo.LetterOfCredit.ABI)
  }

  setupFunctionEncoders() {
    this.functionEncoders.set(LetterOfCreditAction.issue, this.contractReference.methods.issue)
    this.functionEncoders.set(LetterOfCreditAction.requestReject, this.contractReference.methods.requestReject)
  }
}
