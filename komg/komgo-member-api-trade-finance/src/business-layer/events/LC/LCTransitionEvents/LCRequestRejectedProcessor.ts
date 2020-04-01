import { LC_STATE } from '../LCStates'
import { injectable, inject } from 'inversify'
import { TYPES } from '../../../../inversify/types'
import { IVaktMessageNotifier } from '../../../messaging/VaktMessageNotifier'
import { LCEventBaseProcessor } from './LCEventBaseProcessor'
import { ILCTaskProcessor } from '../../../tasks/LCTaskProcessor'
import { CONFIG } from '../../../../inversify/config'
import { COMPANY_LC_ROLE } from '../../../../business-layer/CompanyRole'
import { ILC } from '../../../../data-layer/models/ILC'
import { ILCTimerService } from '../../../../business-layer/timers/LCTimerService'

@injectable()
export class LCRequestRejectedProcessor extends LCEventBaseProcessor {
  public state = LC_STATE.REQUEST_REJECTED

  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.VaktMessageNotifier) vaktMessageNotifier: IVaktMessageNotifier | any,
    @inject(TYPES.LCTaskProcessor) lCTaskProcessor: ILCTaskProcessor | any,
    @inject(TYPES.LCTimerService) private readonly lcTimerService: ILCTimerService
  ) {
    super(companyId, vaktMessageNotifier, lCTaskProcessor)
    this.setupHandlers()
  }

  private setupHandlers() {
    super.addHandler(COMPANY_LC_ROLE.Applicant, lc => this.processForApplicant(lc))
    super.addHandler(COMPANY_LC_ROLE.IssuingBank, lc => this.processForIssuing(lc))
  }

  private async processForApplicant(lc: ILC) {
    await this.deactiveLCTimer(lc)
  }

  private async processForIssuing(lc: ILC) {
    await this.deactiveLCTimer(lc)
  }

  private async deactiveLCTimer(lc: ILC) {
    if (lc.issueDueDate) {
      this.logger.info('Timer deactivation started on request rejected process')
      await this.lcTimerService.lcDeactiveIssuanceTimer(lc)
    }
  }
}
