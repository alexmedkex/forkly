import { LC_STATE } from '../LCStates'
import { injectable, inject } from 'inversify'
import { ILC } from '../../../../data-layer/models/ILC'
import { COMPANY_LC_ROLE } from '../../../CompanyRole'
import { TYPES } from '../../../../inversify/types'
import { DOCUMENT_TYPE } from '../../../documents/documentTypes'
import { IVaktMessageNotifier } from '../../../messaging/VaktMessageNotifier'
import { LCEventBaseProcessor } from './LCEventBaseProcessor'
import { ILCTaskProcessor } from '../../../tasks/LCTaskProcessor'
import { ILCDocumentManager } from './LCDocumentManager'
import getLCMetaData from '../../../util/getLCMetaData'
import { CONFIG } from '../../../../inversify/config'
import { ILCTimerService } from '../../../../business-layer/timers/LCTimerService'

@injectable()
export class LCIssuedProcessor extends LCEventBaseProcessor {
  public state = LC_STATE.ISSUED

  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.LCDocumentManager) private readonly lcDocumentManager: ILCDocumentManager,
    @inject(TYPES.VaktMessageNotifier) vaktMessageNotifier: IVaktMessageNotifier | any,
    @inject(TYPES.LCTaskProcessor) lCTaskProcessor: ILCTaskProcessor | any,
    @inject(TYPES.LCTimerService) private readonly lcTimerService: ILCTimerService
  ) {
    super(companyId, vaktMessageNotifier, lCTaskProcessor)
    this.setupHandlers()
  }

  private setupHandlers() {
    super.addHandler(COMPANY_LC_ROLE.Applicant, lc => this.processForApplicant(lc))
    super.addHandler(COMPANY_LC_ROLE.IssuingBank, lc => this.processForIssuingBank(lc))
  }

  private async processForApplicant(lc: ILC) {
    await this.deactiveLCTimer(lc)
  }

  private async processForIssuingBank(lc: ILC) {
    await this.shareSwiftDocumentWithRecipients(lc, [
      lc.applicantId,
      lc.direct ? lc.beneficiaryId : lc.beneficiaryBankId
    ])
    await this.deactiveLCTimer(lc)
  }

  private async shareSwiftDocumentWithRecipients(lc: ILC, recipients: string[]) {
    this.logger.info(`Sharing Swift document`, getLCMetaData(lc))
    await this.lcDocumentManager.shareDocument(lc, DOCUMENT_TYPE.LC, recipients)
  }

  private async deactiveLCTimer(lc: ILC) {
    if (lc.issueDueDate) {
      this.logger.info('Timer deactivation started on issuing process')
      await this.lcTimerService.lcDeactiveIssuanceTimer(lc)
    }
  }
}
