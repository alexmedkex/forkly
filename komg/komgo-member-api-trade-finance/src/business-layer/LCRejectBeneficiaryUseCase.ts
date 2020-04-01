import { ILC } from '../data-layer/models/ILC'
import { injectable, inject } from 'inversify'
import { TYPES } from '../inversify/types'
import { ILCTransactionManager } from './blockchain/ILCTransactionManager'
import { COMPANY_LC_ROLE } from './CompanyRole'
import { LC_STATE } from './events/LC/LCStates'
import { ILCTaskProcessor } from './tasks/LCTaskProcessor'
import { LCActionBaseUseCase } from './LCActionBaseUseCase'
import { ILCCacheDataAgent } from '../data-layer/data-agents'
import { CONFIG } from '../inversify/config'
import { InvalidOperationException } from '../exceptions'

@injectable()
export class LCRejectBeneficiaryUseCase extends LCActionBaseUseCase {
  companyRole = COMPANY_LC_ROLE.Beneficiary
  private readonly destinationState = LC_STATE.ISSUED_LC_REJECTED

  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.LCTransactionManager) private readonly transactionManager: ILCTransactionManager | any,
    @inject(TYPES.LCTaskProcessor) taskProcessor: ILCTaskProcessor | any,
    @inject(TYPES.LCCacheDataAgent) lcCacheDataAgent: ILCCacheDataAgent | any
  ) {
    super(companyId, taskProcessor, lcCacheDataAgent)
  }

  async rejectBeneficiaryLC(lc: ILC, comment: string) {
    return this.executeUseCase(lc, this.destinationState, { comment })
  }

  protected sendTransaction(lc: ILC, useCaseData?: { [s: string]: any }) {
    return this.transactionManager.issuedLCRejectByBeneficiary(lc.contractAddress, useCaseData.comment)
  }

  /**
   * @inheritdoc
   * @override
   * @param lc
   */
  protected checkLcStateValid(lc: ILC) {
    if (lc.status === LC_STATE.ADVISED || (lc.status === LC_STATE.ISSUED && !this.hasAdvisingBank(lc))) {
      return
    } else {
      throw new InvalidOperationException(
        `Only lc in status [${LC_STATE.ADVISED}] if not directLC, or [${
          LC_STATE.ISSUED
        }] for direct LC can be processed.`
      )
    }
  }

  private hasAdvisingBank(lc: ILC) {
    return !!lc.beneficiaryBankId
  }
}
