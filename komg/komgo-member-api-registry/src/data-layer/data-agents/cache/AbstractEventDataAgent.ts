import { inject, injectable } from 'inversify'

import { TYPES } from '../../../inversify/types'
import { IMemberDAO } from '../../dao/IMemberDAO'

@injectable()
export abstract class AbstractEventDataAgent {
  protected memberDao: IMemberDAO

  constructor(@inject(TYPES.MemberDAO) memberDao: IMemberDAO, @inject(TYPES.Web3) protected readonly web3Instance) {
    this.memberDao = memberDao
  }
}
