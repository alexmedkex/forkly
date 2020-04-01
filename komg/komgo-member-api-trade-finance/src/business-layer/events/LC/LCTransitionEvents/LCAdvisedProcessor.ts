import { inject, injectable } from 'inversify'

import { ILC } from '../../../../data-layer/models/ILC'
import { TYPES } from '../../../../inversify/types'
import { COMPANY_LC_ROLE } from '../../../CompanyRole'
import { DOCUMENT_TYPE } from '../../../documents/documentTypes'
import { IVaktMessageNotifier } from '../../../messaging/VaktMessageNotifier'
import { ILCTaskProcessor } from '../../../tasks/LCTaskProcessor'
import getLCMetaData from '../../../util/getLCMetaData'
import { LC_STATE } from '../LCStates'
import { ILCDocumentManager } from './LCDocumentManager'
import { LCEventBaseProcessor } from './LCEventBaseProcessor'
import { CONFIG } from '../../../../inversify/config'

@injectable()
export class LCAdvisedProcessor extends LCEventBaseProcessor {
  public state = LC_STATE.ADVISED

  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.LCDocumentManager) private readonly lcDocumentManager: ILCDocumentManager | any,
    @inject(TYPES.VaktMessageNotifier) vaktMessageNotifier: IVaktMessageNotifier | any,
    @inject(TYPES.LCTaskProcessor) lCTaskProcessor: ILCTaskProcessor | any
  ) {
    super(companyId, vaktMessageNotifier, lCTaskProcessor)
    this.setupHandlers()
  }

  private setupHandlers() {
    super.addHandler(COMPANY_LC_ROLE.AdvisingBank, lc => this.processForAdvisingBank(lc))
  }

  private async processForAdvisingBank(lc: ILC) {
    await this.shareSwiftDocument(lc)
  }

  private async shareSwiftDocument(lc: ILC) {
    const recipients = [lc.beneficiaryId]

    this.logger.info(`Sharing Swift document`, getLCMetaData(lc))

    this.lcDocumentManager.shareDocument(lc, DOCUMENT_TYPE.LC, recipients)
  }
}
