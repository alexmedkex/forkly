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
import ApproveCounterPartyRequestProcessor from './ApproveCounterPartyRequestProcessor'
import { MESSAGE_TYPE } from '../MessageTypes'
import CounterpartyRequestMessage from '../messages/CounterpartyRequestMessage'

describe('ApproveCounterPartyRequestProcessor', () => {
  let processor: ApproveCounterPartyRequestProcessor
  const counterpartyServiceMock = createMockInstance(CounterpartyService)
  const message = new CounterpartyRequestMessage()

  const mockedRequest = {
    version: 1,
    messageType: MESSAGE_TYPE.ApproveConnectRequest,
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
    processor = new ApproveCounterPartyRequestProcessor(counterpartyServiceMock)
    counterpartyServiceMock.requestApproved = jest.fn()
  })
  it('process request', async () => {
    expect(processor.messageType).toEqual(MESSAGE_TYPE.ApproveConnectRequest)

    const result = await processor.processEvent(mockedRequest)

    expect(counterpartyServiceMock.requestApproved).toHaveBeenCalledWith(
      mockedRequest.data.receiverCompanyId,
      mockedRequest.data.requestId
    )
    expect(result).toBe(true)
  })
})
