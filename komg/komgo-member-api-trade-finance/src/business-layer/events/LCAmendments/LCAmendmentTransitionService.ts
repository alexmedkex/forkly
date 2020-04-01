import { injectable, inject } from 'inversify'
import { LC_AMENDMENT_TRANSITIONS } from './LCAmendmentEvents'
import { ILCAmendmentEventService } from './ILCAmendmentEventService'
import { ILCAmendment } from '@komgo/types'
import { TYPES } from '../../../inversify/types'
import { getLogger } from '@komgo/logging'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'

@injectable()
export class LCAmendmentTransitionService implements ILCAmendmentEventService {
  private logger = getLogger('LCAmendmentTransitionService')
  private transitionProcessors = {}

  constructor(
    @inject(TYPES.LCAmendmentApprovedByIssuingBankEventService) approvedByIssuingBankService: ILCAmendmentEventService,
    @inject(TYPES.LCAmendmentRejectedByIssuingBankEventService) rejectedByIssuingBankService: ILCAmendmentEventService
  ) {
    this.transitionProcessors[LC_AMENDMENT_TRANSITIONS.APPROVED_BY_ISSUING_BANK] = approvedByIssuingBankService
    this.transitionProcessors[LC_AMENDMENT_TRANSITIONS.REJECTED_BY_ISSUING_BANK] = rejectedByIssuingBankService
  }

  async doEvent(amendment: ILCAmendment, decodedEvent: any, rawEvent: any): Promise<any> {
    const service: ILCAmendmentEventService = this.transitionProcessors[decodedEvent.stateId]
    if (!service) {
      this.logger.warn(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.LCAmendmentTransitionEventServiceNotFound,
        'Transition event service not found',
        {
          decodedEvent,
          rawEvent,
          amendmentStaticId: amendment.staticId
        }
      )
      return
    }
    await service.doEvent(amendment, decodedEvent, rawEvent)
  }
}
