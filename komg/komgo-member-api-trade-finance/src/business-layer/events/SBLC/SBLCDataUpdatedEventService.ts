import { ISBLCEventService } from './ISBLCEventService'
import { IStandbyLetterOfCredit } from '@komgo/types'
import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'
import { TYPES } from '../../../inversify/types'
import { ISBLCDataAgent } from '../../../data-layer/data-agents'
import { SBLCDataUpdated } from './SBLCEvents'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'

@injectable()
export class SBLCDataUpdatedEventService implements ISBLCEventService {
  private logger = getLogger('SBLCDataUpdatedEventService')

  constructor(@inject(TYPES.SBLCDataAgent) private sblcDataAgent: ISBLCDataAgent) {}

  async doEvent(sblc: IStandbyLetterOfCredit, decodedEvent: any, rawEvent: any) {
    this.logger.info(`SBLC DataUpdated event`)
    const fieldName = decodedEvent.fieldName
    const data = decodedEvent.data
    this.logger.info(`fieldName: ${fieldName}`)
    if (fieldName === SBLCDataUpdated.SWIFT_SBLC_DOCUMENT) {
      sblc.documentHash = data
    } else if (
      fieldName === SBLCDataUpdated.ISSUING_REFERENCE ||
      fieldName === SBLCDataUpdated.DATA_ISSUING_BANK_COMMENTS
    ) {
      sblc.issuingBankReference = data
    } else if (fieldName === SBLCDataUpdated.ISSUING_BANK_POSTAL_ADDRESS) {
      sblc.issuingBankPostalAddress = data
    } else {
      this.logger.warn(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.SBLCDataUpdatedEventServiceFieldNotSupported,
        'Field trying to update not supported',
        {
          sblcStaticId: sblc.staticId,
          fieldName,
          data
        },
        new Error().stack
      )
      return
    }
    await this.updateSblc(sblc)
  }

  private async updateSblc(sblc: IStandbyLetterOfCredit) {
    this.sblcDataAgent.update({ staticId: sblc.staticId }, sblc)
  }
}
