import { LC_STATE } from '../LCStates'
import { inject } from 'inversify'
import { TYPES } from '../../../../inversify/types'
import { IVaktMessageNotifier } from '../../../messaging/VaktMessageNotifier'
import { LCEventBaseProcessor } from './LCEventBaseProcessor'
import { ILCTaskProcessor } from '../../../tasks/LCTaskProcessor'
import { CONFIG } from '../../../../inversify/config'

export class LCRejectIssuedProcessor extends LCEventBaseProcessor {
  public state = LC_STATE.ISSUED_LC_REJECTED

  constructor(
    @inject(CONFIG.CompanyStaticId) companyId: string,
    @inject(TYPES.VaktMessageNotifier) vaktMessageNotifier: IVaktMessageNotifier | any,
    @inject(TYPES.LCTaskProcessor) lCTaskProcessor: ILCTaskProcessor | any
  ) {
    super(companyId, vaktMessageNotifier, lCTaskProcessor)
  }
}
