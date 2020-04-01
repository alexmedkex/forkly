import { injectable, inject } from 'inversify'
import { TYPES } from '../../../../inversify/types'
import { getLogger } from '@komgo/logging'
import { ILCPresentation } from '../../../../data-layer/models/ILCPresentation'
import { LC_PRESENTAION_CONTRACT_DATA_FIELDS } from '../LCPresentationContractFields'
import { ILCPresentationEventProcessor } from './ILCPresentationEventProcessor'
import { ILCPresentationDataAgent } from '../../../../data-layer/data-agents'
import { IEvent } from '../../../common/IEvent'
import { ILCPresentationDataUpdatedEvent } from './eventTypes/ILCPresentationDataUpdatedEvent'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../../exceptions/utils'

const web3Utils = require('web3-utils')

@injectable()
export class LCPresentationDataUpdatedProcessor implements ILCPresentationEventProcessor {
  private logger = getLogger('LCPresentationDataUpdatedProcessor')
  private dataHandlers = new Map<
    LC_PRESENTAION_CONTRACT_DATA_FIELDS,
    (lcPresentation: ILCPresentation, data: string) => Promise<void>
  >()

  constructor(@inject(TYPES.LCPresentationDataAgent) private readonly dataAgent: ILCPresentationDataAgent) {
    this.setDataHandlers()
  }

  async processEvent(eventData: ILCPresentationDataUpdatedEvent, event: IEvent) {
    this.logger.info('Processing DataUpdate', { address: event.address })

    const fieldName = web3Utils.hexToString(eventData.fieldName)
    const data = eventData.data

    const presentation = await this.dataAgent.getByAttributes({ 'contracts.contractAddress': event.address })

    if (!presentation) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LCPresentationByAddressNotFound,
        'Cant find presentation for addess',
        { contractAddress: event.address },
        new Error().stack
      )
      return
    }

    this.logger.info('Parsing DataUpdate event data', {
      address: event.address,
      field: fieldName
    })

    const handler = this.dataHandlers.get(fieldName)

    if (!handler) {
      this.logger.info(`Processing DataUpdate: No data handler for ${fieldName}`, {
        presentationId: presentation.staticId
      })

      return
    }

    return handler(presentation, data)
  }

  private setDataHandlers() {
    this.dataHandlers.set(LC_PRESENTAION_CONTRACT_DATA_FIELDS.IssuingBankComments, (presentation, data) =>
      this.updateField(presentation, 'issuingBankComments', data)
    )
    this.dataHandlers.set(LC_PRESENTAION_CONTRACT_DATA_FIELDS.NominatedBankComments, (presentation, data) =>
      this.updateField(presentation, 'nominatedBankComments', data)
    )
    this.dataHandlers.set(LC_PRESENTAION_CONTRACT_DATA_FIELDS.BeneficiaryComments, (presentation, data) =>
      this.updateField(presentation, 'beneficiaryComments', data)
    )
    this.dataHandlers.set(LC_PRESENTAION_CONTRACT_DATA_FIELDS.ApplicantComments, (presentation, data) =>
      this.updateField(presentation, 'applicantComments', data)
    )
  }

  private async updateField(presentation: ILCPresentation, fieldName: keyof ILCPresentation, data: string) {
    return this.dataAgent.updateField(presentation.staticId, fieldName, data)
  }
}
