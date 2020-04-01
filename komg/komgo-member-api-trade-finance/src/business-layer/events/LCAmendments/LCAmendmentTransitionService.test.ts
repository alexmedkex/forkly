import 'reflect-metadata'
import { LCAmendmentTransitionService } from './LCAmendmentTransitionService'
import { ILCAmendmentEventService } from './ILCAmendmentEventService'
import { buildFakeAmendment } from '@komgo/types'
import { IEvent } from '../../common/IEvent'
import { LC_AMENDMENT_TRANSITIONS } from './LCAmendmentEvents'

const lcAmendmentApprovedByIssuingBankEventService: ILCAmendmentEventService = {
  doEvent: jest.fn()
}

const lcAmendmentRejectedByIssuingBankEventService: ILCAmendmentEventService = {
  doEvent: jest.fn()
}

const rawEvent: IEvent = {
  transactionHash: '0x123456',
  address: '0x0',
  blockNumber: 1,
  data: '0x123',
  topics: ['0x69']
}

const decodedEventApprovedIssuingBank = {
  stateId: LC_AMENDMENT_TRANSITIONS.APPROVED_BY_ISSUING_BANK
}

const decodedEventRejectedIssuingBank = {
  stateId: LC_AMENDMENT_TRANSITIONS.REJECTED_BY_ISSUING_BANK
}

const decodedEventUnknown = {
  stateId: 'I have no idea what is this'
}

describe('LCAmendmentTransitionService', () => {
  let lcAmendmentTransitionService: ILCAmendmentEventService

  beforeEach(() => {
    lcAmendmentTransitionService = new LCAmendmentTransitionService(
      lcAmendmentApprovedByIssuingBankEventService,
      lcAmendmentRejectedByIssuingBankEventService
    )
  })

  it('UNKNOWN STATE', async () => {
    await lcAmendmentTransitionService.doEvent(buildFakeAmendment(), decodedEventUnknown, rawEvent)
    expect(lcAmendmentApprovedByIssuingBankEventService.doEvent).toHaveBeenCalledTimes(0)
  })

  it('APPROVED_BY_ISSUING_BANK', async () => {
    await lcAmendmentTransitionService.doEvent(buildFakeAmendment(), decodedEventApprovedIssuingBank, rawEvent)
    expect(lcAmendmentApprovedByIssuingBankEventService.doEvent).toHaveBeenCalledTimes(1)
    expect(lcAmendmentRejectedByIssuingBankEventService.doEvent).toHaveBeenCalledTimes(0)
  })

  it('REJECTED_BY_ISSUING_BANK', async () => {
    await lcAmendmentTransitionService.doEvent(buildFakeAmendment(), decodedEventRejectedIssuingBank, rawEvent)
    expect(lcAmendmentRejectedByIssuingBankEventService.doEvent).toHaveBeenCalledTimes(1)
    expect(lcAmendmentApprovedByIssuingBankEventService.doEvent).toHaveBeenCalledTimes(0)
  })
})
