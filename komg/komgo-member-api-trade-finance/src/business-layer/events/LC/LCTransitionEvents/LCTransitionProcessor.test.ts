import 'reflect-metadata'
import { LCTransitionProcessor } from './LCTransitionProcessor'
import { ILCTransitionEventProcessor } from './ILCTransitionEventProcessor'
import { LC_STATE } from '../LCStates'
import { ILCCacheDataAgent } from '../../../../data-layer/data-agents'
import { fakeLetterOfCredit } from '../../../messaging/mock-data/fakeLetterOfCredit'

const web3Utils = require('web3-utils')

describe('LCTransitionProcessor', () => {
  let processor: LCTransitionProcessor

  const lCCacheDataAgentMock: ILCCacheDataAgent = {
    saveLC: jest.fn(),
    getLC: jest.fn(),
    getLCs: jest.fn(),
    updateField: jest.fn(),
    updateStatus: jest.fn(),
    updateLcByReference: jest.fn(),
    getNonce: jest.fn(),
    count: jest.fn()
  }

  const mockRequestedEvent = {
    stateId: '0x7265717565737465640000000000000000000000000000000000000000000000', // requested
    blockNumber: 10,
    address: '0x0'
  }

  const mockRequestedProcessor: ILCTransitionEventProcessor = {
    state: LC_STATE.REQUESTED,
    processStateTransition: jest.fn()
  }

  const mockIssuedLcRejectedEvent = {
    stateId: web3Utils.toHex(LC_STATE.ISSUED_LC_REJECTED),
    blockNumber: 10,
    address: '0x0'
  }

  const mockIssuedLcRejectedProcessor: ILCTransitionEventProcessor = {
    state: LC_STATE.ISSUED_LC_REJECTED,
    processStateTransition: jest.fn()
  }

  beforeEach(() => {
    processor = new LCTransitionProcessor(lCCacheDataAgentMock, [mockRequestedProcessor, mockIssuedLcRejectedProcessor])
  })

  it('should initialize processors', () => {
    const processors = (processor as any).processors
    expect(processors[mockRequestedProcessor.state]).toBe(mockRequestedProcessor)
  })

  it('should process event', async () => {
    const doc: any = { _id: '1', applicantId: 'company1' }
    lCCacheDataAgentMock.getLC = jest.fn().mockImplementation(() => doc)
    await processor.doEvent(doc, mockRequestedEvent, null)

    expect(lCCacheDataAgentMock.updateStatus).toHaveBeenCalledWith(doc._id, 'requested', doc.applicantId)

    expect(mockRequestedProcessor.processStateTransition).toHaveBeenCalledWith(doc, {
      stateId: LC_STATE.REQUESTED,
      blockNumber: mockRequestedEvent.blockNumber,
      performerId: 'company1'
    })
  })
  it('should select the correct performer when an LC is rejected by an advising bank', async () => {
    const lc = fakeLetterOfCredit({ status: LC_STATE.ISSUED })
    lCCacheDataAgentMock.getLC = jest.fn().mockImplementation(() => lc)
    await processor.doEvent(lc, mockIssuedLcRejectedEvent, null)

    expect(lCCacheDataAgentMock.updateStatus).toHaveBeenCalledWith(
      lc._id,
      LC_STATE.ISSUED_LC_REJECTED,
      lc.beneficiaryBankId
    )
  })
})
