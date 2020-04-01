import 'reflect-metadata'

const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}
const getLoggerMock = jest.fn(() => loggerMock)
jest.mock('@komgo/logging', () => ({
  getLogger: getLoggerMock
}))

import EventsProcessor from './EventsProcessor'
import { IEventProcessorBase } from './IEventProcessor'
import { MESSAGE_TYPE } from '../MessageTypes'

let eventsProcessor
const processor: IEventProcessorBase = {
  messageType: MESSAGE_TYPE.ApproveConnectRequest,
  processEvent: jest.fn()
}

describe('EventsProcessor', () => {
  beforeEach(() => {
    eventsProcessor = new EventsProcessor([processor])
  })

  it('register processor for type', () => {
    expect(loggerMock.info).toHaveBeenCalled()
  })

  it('fails if no processor is registered', async () => {
    const result = await eventsProcessor.processEvent('some_event', {})

    expect(result).toBeFalsy()
    expect(loggerMock.error).toHaveBeenCalled()
  })

  it('proccess event', async () => {
    const msg = { messageType: MESSAGE_TYPE.ApproveConnectRequest }
    await eventsProcessor.processEvent(MESSAGE_TYPE.ApproveConnectRequest, {
      messageType: MESSAGE_TYPE.ApproveConnectRequest
    })

    expect(processor.processEvent).toHaveBeenCalledWith(msg)
  })
})
