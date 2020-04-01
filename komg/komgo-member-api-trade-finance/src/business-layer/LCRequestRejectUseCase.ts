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

@injectable()
export class LCRequestRejectUseCase extends LCActionBaseUseCase {
  state = LC_STATE.REQUESTED
  companyRole = COMPANY_LC_ROLE.IssuingBank
  private readonly destinationState = LC_STATE.REQUEST_REJECTED

  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.LCTransactionManager) private readonly transactionManager: ILCTransactionManager | any,
    @inject(TYPES.LCTaskProcessor) taskProcessor: ILCTaskProcessor | any,
    @inject(TYPES.LCCacheDataAgent) lcCacheDataAgent: ILCCacheDataAgent | any
  ) {
    super(companyId, taskProcessor, lcCacheDataAgent)
  }

  async rejectLC(lc: ILC, comment: string) {
    return this.executeUseCase(lc, this.destinationState, { comment })
  }

  /**
   * @inheritdoc
   * @override
   */
  protected sendTransaction(lc: ILC, useCaseData: { [s: string]: any }) {
    return this.transactionManager.requestRejectLC(lc.contractAddress, useCaseData.comment)
  }
}
