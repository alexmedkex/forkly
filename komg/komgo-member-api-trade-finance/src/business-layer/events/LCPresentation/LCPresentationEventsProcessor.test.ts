import 'reflect-metadata'
import { LCPresentationEventsProcessor } from './LCPresentationEventsProcessor'
import { InvalidMessageException } from '../../../exceptions'

describe('LCPresentationEventsProcessor', () => {
  let processor: LCPresentationEventsProcessor
  let eventMappings

  const sampleEvent = {
    topics: ['0x3f975c6370501e982d9fb36fa04975bb6d1c92bdb4e51d54099cb675ba354bcd'],
    blockNumber: 336,
    transactionHash: '0x0de4ea415e830ac80443f1082622e81b67306accf305596566fbb83082673feb',
    address: '0x2B0Cf1aE69E24044776e5e3FfBE2424FdeFD44DF',
    data: ''
  }

  let mockLCPresentationCreatedProcessor: any
  let mockLCPresentationTransitionProcessor: any

  beforeAll(() => {
    mockLCPresentationCreatedProcessor = {
      processEvent: jest.fn()
    }
    mockLCPresentationTransitionProcessor = {
      processEvent: jest.fn()
    }
    processor = new LCPresentationEventsProcessor(
      mockLCPresentationCreatedProcessor,
      mockLCPresentationTransitionProcessor,
      null
    )
    eventMappings = processor.getEventMappings()
  })

  it('should process event', async () => {
    await processor.processEvent(sampleEvent)

    expect(mockLCPresentationCreatedProcessor.processEvent).toHaveBeenCalled()
  })

  it('should fail if unknown event', async () => {
    expect(processor.processEvent({ ...sampleEvent, topics: [] })).rejects.toBe(
      new InvalidMessageException('Could not decode event emitted from contract')
    )

    expect(mockLCPresentationCreatedProcessor.processEvent).not.toHaveBeenCalled()
  })
})
