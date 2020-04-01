import { ISBLCEventService } from './ISBLCEventService'
import { IStandbyLetterOfCredit } from '@komgo/types'
import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { SBLCTransitions } from './SBLCEvents'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'

@injectable()
export class SBLCTransitionService implements ISBLCEventService {
  private logger = getLogger('IStandbyLetterOfCredit')
  private transitionProcessors = {}

  constructor(
    @inject(TYPES.SBLCIssuedEventService) sblcIssuedEventService,
    @inject(TYPES.SBLCRejectRequestEventService) sblcRequestRejectEventService
  ) {
    this.transitionProcessors[SBLCTransitions.ISSUED] = sblcIssuedEventService
    this.transitionProcessors[SBLCTransitions.REQUEST_REJECTED] = sblcRequestRejectEventService
  }

  async doEvent(sblc: IStandbyLetterOfCredit, decodedEvent: any, rawEvent: any) {
    const service: ISBLCEventService = this.transitionProcessors[decodedEvent.stateId]
    if (!service) {
      this.logger.warn(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.SBLCTransitionEventServiceNotFound,
        'SBLC Transition event service not found',
        {
          decodedEvent,
          rawEvent,
          sblcStaticId: sblc.staticId
        },
        new Error().stack
      )
      return
    }
    await service.doEvent(sblc, decodedEvent, rawEvent)
  }
}
