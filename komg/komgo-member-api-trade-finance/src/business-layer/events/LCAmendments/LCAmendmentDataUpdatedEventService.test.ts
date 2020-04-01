import 'reflect-metadata'
import { LCAmendmentDataUpdatedEventService } from './LCAmendmentDataUpdatedEventService'
import { ILCAmendmentEventService } from './ILCAmendmentEventService'
import { buildFakeAmendment } from '@komgo/types'
import { IEvent } from '../../common/IEvent'
import { LC_AMENDMENT_DATA_UPDATED } from './LCAmendmentEvents'

const web3Utils = require('web3-utils')

const lcAmendmentRejectionDataUpdatedEventService: ILCAmendmentEventService = {
  doEvent: jest.fn()
}

const rawEvent: IEvent = {
  transactionHash: '0x123456',
  address: '0x0',
  blockNumber: 1,
  data: '0x123',
  topics: ['0x69']
}

const decodedEventRejectedIssuingBank = {
  fieldName: web3Utils.asciiToHex(LC_AMENDMENT_DATA_UPDATED.ISSUING_BANK_REJECTION_COMMENTS)
}

const decodedEventUnknown = {
  fieldName: web3Utils.asciiToHex('I have no idea what is this')
}

describe('LCAmendmentDataUpdatedEventService', () => {
  let lcAmendmentDataUpdatedService: ILCAmendmentEventService

  beforeEach(() => {
    lcAmendmentDataUpdatedService = new LCAmendmentDataUpdatedEventService(lcAmendmentRejectionDataUpdatedEventService)
  })

  it('UNKNOWN STATE', async () => {
    await lcAmendmentDataUpdatedService.doEvent(buildFakeAmendment(), decodedEventUnknown, rawEvent)
    expect(lcAmendmentRejectionDataUpdatedEventService.doEvent).toHaveBeenCalledTimes(0)
  })

  it('Reject issuing bank', async () => {
    await lcAmendmentDataUpdatedService.doEvent(buildFakeAmendment(), decodedEventRejectedIssuingBank, rawEvent)
    expect(lcAmendmentRejectionDataUpdatedEventService.doEvent).toHaveBeenCalledTimes(1)
  })
})
