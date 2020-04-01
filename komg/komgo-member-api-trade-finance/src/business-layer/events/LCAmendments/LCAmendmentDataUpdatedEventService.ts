import { injectable, inject } from 'inversify'
import { ILCAmendment } from '@komgo/types'
import { ILCAmendmentEventService } from './ILCAmendmentEventService'
import { getLogger } from '@komgo/logging'
import { LC_AMENDMENT_DATA_UPDATED } from './LCAmendmentEvents'
import { TYPES } from '../../../inversify/types'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '..//../../exceptions/utils'

const web3Utils = require('web3-utils')

@injectable()
export class LCAmendmentDataUpdatedEventService implements ILCAmendmentEventService {
  private logger = getLogger('LCAmendmentTransitionService')
  private transitionProcessors = {}

  constructor(
    @inject(TYPES.LCAmendmentRejectionDataUpdatedEventService)
    lcAmendmentRejectionDataUpdatedEventService: ILCAmendmentEventService
  ) {
    this.transitionProcessors[
      LC_AMENDMENT_DATA_UPDATED.ISSUING_BANK_REJECTION_COMMENTS
    ] = lcAmendmentRejectionDataUpdatedEventService
  }

  async doEvent(amendment: ILCAmendment, decodedEvent: any, rawEvent: any): Promise<any> {
    this.logger.info(`LCAmendment DataUpdated event`)
    const nullByte = /\u0000/g
    const fieldName = web3Utils
      .hexToAscii(decodedEvent.fieldName)
      .trim()
      .replace(nullByte, '')
    this.logger.info(`fieldName: ${fieldName}`)
    const service = this.transitionProcessors[fieldName]
    if (!service) {
      this.logger.warn(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.DataUpdatedServiceNotFound,
        'Service for DataUpdated not found',
        {
          fieldName,
          amendmentId: amendment.staticId,
          decodedEvent
        }
      )
      return
    }
    await service.doEvent(amendment, decodedEvent, rawEvent)
  }
}
