import { ILC } from '../data-layer/models/ILC'
import { injectable, inject } from 'inversify'
import { TYPES } from '../inversify/types'
import { ILCTransactionManager } from './blockchain/ILCTransactionManager'
import { COMPANY_LC_ROLE } from './CompanyRole'
import { LC_STATE } from './events/LC/LCStates'
import { ILCTaskProcessor } from './tasks/LCTaskProcessor'
import { LCActionBaseUseCase } from './LCActionBaseUseCase'
import { ILCCacheDataAgent } from '../data-layer/data-agents'
import { getLogger } from '@komgo/logging'
import { CONFIG } from '../inversify/config'
import { InvalidOperationException } from '../exceptions'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../exceptions/utils'

@injectable()
export class LCAdviseUseCase extends LCActionBaseUseCase {
  state = LC_STATE.ISSUED
  companyRole = COMPANY_LC_ROLE.AdvisingBank
  private readonly destinationState = LC_STATE.ADVISED
  private logger = getLogger('LCAdviseUseCase')

  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.LCTransactionManager) private readonly transactionManager: ILCTransactionManager | any,
    @inject(TYPES.LCTaskProcessor) taskProcessor: ILCTaskProcessor | any,
    @inject(TYPES.LCCacheDataAgent) lcCacheDataAgent: ILCCacheDataAgent | any
  ) {
    super(companyId, taskProcessor, lcCacheDataAgent)
  }

  async adviseLC(lc: ILC) {
    if (this.isDirectLC(lc)) {
      this.logger.error(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.InvalidActionDirectLCAdvising,
        `Action not allowed for direct LC`,
        { lcReference: lc.reference },
        new Error().stack
      )
      throw new InvalidOperationException(`Action not allowed for direct LC`)
    }
    return this.executeUseCase(lc, this.destinationState)
  }

  /**
   * @inheritdoc
   * @override
   */
  protected sendTransaction(lc: ILC) {
    return this.transactionManager.adviseLC(lc.contractAddress)
  }

  private isDirectLC(lc: ILC) {
    return !lc.beneficiaryBankId
  }
}
