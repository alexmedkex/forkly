import 'reflect-metadata'
// tslint:disable-next-line:no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  metric: jest.fn()
}
const getLoggerMock = jest.fn(() => loggerMock)
jest.mock('@komgo/logging', () => ({
  getLogger: getLoggerMock
}))

import CounterpartyService from '../../counterparty/CounterpartyService'
import RejectCounterPartyRequestProcessor from './RejectCounterPartyRequestProcessor'
import { MESSAGE_TYPE } from '../MessageTypes'

describe('RejectCounterPartyRequestProcessor', () => {
  let processor: RejectCounterPartyRequestProcessor
  const counterpartyServiceMock = createMockInstance(CounterpartyService)

  const mockedRequest = {
    version: 1,
    messageType: MESSAGE_TYPE.RejectConnectRequest,
    context: {
      requestId: '1'
    },
    data: {
      requestId: '1',
      requesterCompanyId: '1',
      receiverCompanyId: '2'
    }
  }

  beforeEach(() => {
    processor = new RejectCounterPartyRequestProcessor(counterpartyServiceMock)
    counterpartyServiceMock.requestRejected = jest.fn()
  })
  it('process request', async () => {
    expect(processor.messageType).toEqual(MESSAGE_TYPE.RejectConnectRequest)

    const result = await processor.processEvent(mockedRequest)

    expect(counterpartyServiceMock.requestRejected).toHaveBeenCalledWith(
      mockedRequest.data.receiverCompanyId,
      mockedRequest.data.requestId
    )
    expect(result).toBe(true)
  })
})
