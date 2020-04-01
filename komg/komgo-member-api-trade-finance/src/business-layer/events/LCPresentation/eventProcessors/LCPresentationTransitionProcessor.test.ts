import 'reflect-metadata'
import { LCPresentationTransitionProcessor } from './LCPresentationTransitionProcessor'
import { IEvent } from '../../../common/IEvent'
import { mockPresentation } from './mock-data/LCPresentation'
import * as _ from 'lodash'
import { LCPresentationContractStatus } from '../LCPresentationContractStatus'
import { ILCPresentationTransitionEvent } from './eventTypes/ILCPresentationTransitionEvent'
import { InvalidMessageException } from '../../../../exceptions'

let mockPresentationService
let mockLcCacheDataAgent
let mockEventProcessor

const mockLC = {
  beneficiaryId: 'ben',
  applicantId: 'app',
  issuingBankId: 'issuing'
}

const mockTransitionEventData: ILCPresentationTransitionEvent = {
  stateId: '0xcd83c3c89af26a2e7e9a4890168b2b438291ac0e27e4a31fe3eb3ababa9084e8', // doc presented
  stateIdDecoded: ''
}
const mockTx = '0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1aa'
const mockContractAddress = '0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1bd'
const mockEvent: IEvent = {
  data: '',
  topics: ['0x56242c0768035c3610fe3b4edfedda794667f12da0bc8fb6c6dc9f6d94f9f1bd'],
  blockNumber: 1234,
  transactionHash: mockTx,
  address: mockContractAddress
}

let processor: LCPresentationTransitionProcessor
describe('LCPresentationTransitionProcessor', () => {
  beforeEach(() => {
    mockLcCacheDataAgent = {
      getLC: jest.fn().mockReturnValue(mockLC)
    }
    mockPresentationService = {
      getLCPresentationByReference: jest.fn(() => _.cloneDeep(mockPresentation)),
      updatePresentation: jest.fn(pres => pres),
      getLCPresentation: jest.fn(() => _.cloneDeep(mockPresentation))
    }
    mockEventProcessor = {
      state: LCPresentationContractStatus.DocumentsPresented,
      processEvent: jest.fn()
    }
    processor = new LCPresentationTransitionProcessor(
      mockPresentationService as any,
      mockLcCacheDataAgent as any,
      mockPresentation.nominatedBankId,
      [mockEventProcessor as any]
    )
  })

  it('handle transition event', async () => {
    await processor.processEvent(mockTransitionEventData, mockEvent)

    expect(mockLcCacheDataAgent.getLC).toBeCalled()
    expect(mockPresentationService.getLCPresentation).toBeCalledWith({
      'contracts.contractAddress': mockContractAddress
    })
    expect(mockEventProcessor.processEvent).toBeCalled()
  })

  it('fail - presentation not found', async () => {
    mockPresentationService.getLCPresentation = jest.fn().mockReturnValue(null)
    await expect(processor.processEvent(mockTransitionEventData, mockEvent)).rejects.toThrow(InvalidMessageException)
    expect(mockEventProcessor.processEvent).not.toBeCalled()
  })

  it('fail - lc not found', async () => {
    mockLcCacheDataAgent.getLC = jest.fn().mockReturnValue(null)
    await expect(processor.processEvent(mockTransitionEventData, mockEvent)).rejects.toThrow(InvalidMessageException)
    expect(mockEventProcessor.processEvent).not.toBeCalled()
  })

  it('fail - processor not found', async () => {
    mockEventProcessor = {
      state: LCPresentationContractStatus.DocumentsCompliantByIssuingBank,
      processEvent: jest.fn()
    }
    processor = new LCPresentationTransitionProcessor(
      mockPresentationService as any,
      mockLcCacheDataAgent as any,
      mockPresentation.nominatedBankId,
      [mockEventProcessor as any]
    )

    await processor.processEvent(mockTransitionEventData, mockEvent)
    expect(mockEventProcessor.processEvent).not.toBeCalled()
  })
})
