import { LC_STATE } from '../LCStates'
import { injectable, inject } from 'inversify'
import { TYPES } from '../../../../inversify/types'
import { IVaktMessageNotifier } from '../../../messaging/VaktMessageNotifier'
import { LCEventBaseProcessor } from './LCEventBaseProcessor'
import { ILCTaskProcessor } from '../../../tasks/LCTaskProcessor'
import { COMPANY_LC_ROLE } from '../../../CompanyRole'
import { ILC } from '../../../../data-layer/models/ILC'
import { DOCUMENT_TYPE } from '../../../documents/documentTypes'
import { ILCDocumentManager } from './LCDocumentManager'
import getLCMetaData from '../../../util/getLCMetaData'
import { ILCTimerService } from '../../../timers/LCTimerService'
import { CONFIG } from '../../../../inversify/config'

@injectable()
export class LCRequestedProcessor extends LCEventBaseProcessor {
  public state = LC_STATE.REQUESTED

  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.VaktMessageNotifier) vaktMessageNotifier: IVaktMessageNotifier,
    @inject(TYPES.LCTaskProcessor) lCTaskProcessor: ILCTaskProcessor,
    @inject(TYPES.LCDocumentManager) private readonly lcDocumentManager: ILCDocumentManager,
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
    const recepients = [lc.issuingBankId, lc.beneficiaryId]
    if (lc.beneficiaryBankId) {
      recepients.push(lc.beneficiaryBankId)
    }

    // LC PDF should be shared with all parties, since on UI it will
    await this.shareLCApplicationDocumentWithRecipients(lc, recepients)
    await this.createLCTimer(lc, COMPANY_LC_ROLE.Applicant)
  }

  private async processForIssuing(lc: ILC) {
    await this.createLCTimer(lc, COMPANY_LC_ROLE.IssuingBank)
  }

  private async shareLCApplicationDocumentWithRecipients(lc: ILC, recipients: string[]) {
    this.logger.info(`Sharing LC Application document`, getLCMetaData(lc))
    await this.lcDocumentManager.shareDocument(lc, DOCUMENT_TYPE.LC_Application, recipients)
  }

  private async createLCTimer(lc: ILC, companyRole: COMPANY_LC_ROLE) {
    if (lc.issueDueDate) {
      await this.lcTimerService.lcIssuanceTimer(lc, companyRole)
    }
  }
}
