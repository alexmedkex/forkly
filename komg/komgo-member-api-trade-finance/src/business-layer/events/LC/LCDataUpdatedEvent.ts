import { ILCEventService } from './ILCEventService'
import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'
import { TYPES } from '../../../inversify/types'
import { ILCCacheDataAgent } from '../../../data-layer/data-agents'
import { LC_CONTRACT_DATA_FIELDS } from './LCContractDataFields'
import { ILC } from '../../../data-layer/models/ILC'
import getLCMetaData from '../../util/getLCMetaData'

const web3Utils = require('web3-utils')

@injectable()
export class LCDataUpdatedEvent implements ILCEventService {
  private logger = getLogger('LCDataUpdatedEvent')
  private dataHandlers = new Map<LC_CONTRACT_DATA_FIELDS, (lc: ILC, data: string) => Promise<void>>()
  constructor(@inject(TYPES.LCCacheDataAgent) private readonly cacheDataAgent: ILCCacheDataAgent | any) {
    this.setDataHandlers()
  }

  async doEvent(lc: ILC, decodedEvent: any, rawEvent: any) {
    this.logger.info('Processing DataUpdate', {
      ...getLCMetaData(lc),
      decodedEvent,
      rawEvent
    })

    const fieldName = web3Utils.hexToString(decodedEvent.fieldName)
    const data = decodedEvent.data
    this.logger.info('Parsing DataUpdate event data', {
      ...getLCMetaData(lc),
      field: fieldName
    })

    const handler = this.dataHandlers.get(fieldName)

    if (!handler) {
      this.logger.info(`Processing DataUpdate: No data handler for ${fieldName}`, {
        ...getLCMetaData(lc)
      })

      return
    }

    return handler(lc, data)
  }

  private setDataHandlers() {
    this.dataHandlers.set(LC_CONTRACT_DATA_FIELDS.DATA_ISSUING_BANK_COMMENTS, (lc, data) =>
      this.updateField(lc, 'issuingBankComments', data)
    )
    this.dataHandlers.set(LC_CONTRACT_DATA_FIELDS.DATA_ADVISING_BANK_COMMENTS, (lc, data) =>
      this.updateField(lc, 'advisingBankComments', data)
    )
    this.dataHandlers.set(LC_CONTRACT_DATA_FIELDS.DATA_BENEFICIARY_COMMENTS, (lc, data) =>
      this.updateField(lc, 'beneficiaryComments', data)
    )
    this.dataHandlers.set(LC_CONTRACT_DATA_FIELDS.SWIFT_LC_DOCUMENT_REFERENCE, (lc, data) =>
      this.updateField(lc, 'issuingBankReference', data)
    )
  }

  private async updateField(lc: ILC, fieldName: keyof ILC, data: string) {
    return this.cacheDataAgent.updateField(lc._id, fieldName, data)
  }
}
