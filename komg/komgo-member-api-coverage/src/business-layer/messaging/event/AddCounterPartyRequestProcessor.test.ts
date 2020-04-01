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
import AddCounterPartyRequestProcessor from './AddCounterPartyRequestProcessor'
import { MESSAGE_TYPE } from '../MessageTypes'

describe('AddCounterPartyRequestProcessor', () => {
  let processor: AddCounterPartyRequestProcessor
  const counterpartyServiceMock = createMockInstance(CounterpartyService)

  const mockedRequest = {
    version: 1,
    messageType: MESSAGE_TYPE.ConnectRequest,
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
    processor = new AddCounterPartyRequestProcessor(counterpartyServiceMock)
    counterpartyServiceMock.addRequest = jest.fn()
  })
  it('process request', async () => {
    expect(processor.messageType).toEqual(MESSAGE_TYPE.ConnectRequest)

    const result = await processor.processEvent(mockedRequest)

    expect(counterpartyServiceMock.addRequest).toHaveBeenCalledWith(
      mockedRequest.data.requesterCompanyId,
      mockedRequest.data.requestId
    )
    expect(result).toBe(true)
  })
})
