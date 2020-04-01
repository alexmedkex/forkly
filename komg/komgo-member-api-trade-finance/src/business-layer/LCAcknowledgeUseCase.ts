import { ILC } from '../data-layer/models/ILC'
import { injectable, inject } from 'inversify'
import { TYPES } from '../inversify/types'
import { ILCTransactionManager } from './blockchain/ILCTransactionManager'
import { COMPANY_LC_ROLE } from './CompanyRole'
import { LC_STATE } from './events/LC/LCStates'
import { getLogger } from '@komgo/logging'
import { ILCTaskProcessor } from './tasks/LCTaskProcessor'
import { LCActionBaseUseCase } from './LCActionBaseUseCase'
import { ILCCacheDataAgent } from '../data-layer/data-agents'
import { CONFIG } from '../inversify/config'
import { InvalidOperationException } from '../exceptions'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../exceptions/utils'

@injectable()
export class LCAcknowledgeUseCase extends LCActionBaseUseCase {
  state = LC_STATE.ISSUED
  companyRole = COMPANY_LC_ROLE.Beneficiary
  private logger = getLogger('LCAcknowledgeUseCase')
  private readonly destinationState = LC_STATE.ACKNOWLEDGED

  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.LCTransactionManager) private readonly transactionManager: ILCTransactionManager | any,
    @inject(TYPES.LCTaskProcessor) taskProcessor: ILCTaskProcessor | any,
    @inject(TYPES.LCCacheDataAgent) lcCacheDataAgent: ILCCacheDataAgent | any
  ) {
    super(companyId, taskProcessor, lcCacheDataAgent)
  }

  async acknowledgeLC(lc: ILC) {
    return this.executeUseCase(lc, this.destinationState)
  }

  /**
   * @inheritdoc
   * @override
   * @param lc
   */
  protected sendTransaction(lc) {
    return this.transactionManager.acknowledgeLC(lc.contractAddress)
  }

  /**
   * @override
   */
  protected checkLcStateValid(lc: ILC) {
    if (lc.status === LC_STATE.ADVISED || (lc.status === LC_STATE.ISSUED && this.directLC(lc))) {
      return
    } else {
      this.logger.error(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.LCInvalidStatus,
        { lcReference: lc.reference },
        new Error().stack
      )
      throw new InvalidOperationException(
        `Only lc in status [${LC_STATE.ADVISED}] if not directLC, or [${
          LC_STATE.ISSUED
        }] for direct LC can be processed.`
      )
    }
  }

  private directLC(lc: ILC) {
    return !lc.beneficiaryBankId
  }
}
