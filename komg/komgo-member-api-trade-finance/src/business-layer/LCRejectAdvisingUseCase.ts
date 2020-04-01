import { ILC } from '../data-layer/models/ILC'
import { injectable, inject } from 'inversify'
import { TYPES } from '../inversify/types'
import { ILCTransactionManager } from './blockchain/ILCTransactionManager'
import { LCActionBaseUseCase } from './LCActionBaseUseCase'
import { COMPANY_LC_ROLE } from './CompanyRole'
import { LC_STATE } from './events/LC/LCStates'
import { ILCTaskProcessor } from './tasks/LCTaskProcessor'
import { ILCCacheDataAgent } from '../data-layer/data-agents'
import { CONFIG } from '../inversify/config'
import { InvalidOperationException } from '../exceptions'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../exceptions/utils'

@injectable()
export class LCRejectAdvisingUseCase extends LCActionBaseUseCase {
  state = LC_STATE.ISSUED
  companyRole = COMPANY_LC_ROLE.AdvisingBank
  private readonly destinationState = LC_STATE.ISSUED_LC_REJECTED

  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.LCTransactionManager) private readonly transactionManager: ILCTransactionManager,
    @inject(TYPES.LCTaskProcessor) taskProcessor: ILCTaskProcessor,
    @inject(TYPES.LCCacheDataAgent) lcCacheDataAgent: ILCCacheDataAgent
  ) {
    super(companyId, taskProcessor, lcCacheDataAgent)
  }

  async rejectAdvisingLC(lc: ILC, comment: string) {
    if (this.isDirectLC(lc)) {
      this.baseLogger.error(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.InvalidActionDirectLCRejectAdvising,
        `Action not allowed for direct LC`,
        {
          lcId: lc._id
        },
        new Error().stack
      )
      throw new InvalidOperationException(`Action not allowed for direct LC`)
    }
    return this.executeUseCase(lc, this.destinationState, { comment })
  }

  protected sendTransaction(lc: ILC, useCaseData?: { [s: string]: any }) {
    return this.transactionManager.issuedLCRejectByAdvisingBank(lc.contractAddress, useCaseData.comment)
  }

  private isDirectLC(lc: ILC) {
    return !lc.beneficiaryBankId
  }
}
