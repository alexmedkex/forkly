// import { CommonBrokerMessageDataAgent } from '../data-layer/data-agent/CommonBrokerMessageDataAgent'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { CommonBrokerMessageDataAgent } from '../data-layer/data-agent/CommonBrokerMessageDataAgent'
import { STATUS, ICommonBrokerMessage } from '../data-layer/models/ICommonBrokerMessage'
import { MessageProcessingError } from '../messaging-layer/types'

import AuditingService from './AuditingService'

describe('Test AuditService.ts', () => {
  let auditService: AuditingService
  let mockCommonBrokerMessageDataAgent: jest.Mocked<CommonBrokerMessageDataAgent>

  const routingKey = 'routingKey'
  const messageProperties = {
    properties: {
      recipientMnid: 'recipientMnid',
      senderMnid: 'senderMnid',
      senderPlatform: 'vakt'
    }
  }
  const messagePayload = {
    message: {
      payload: '{ payload }'
    }
  }

  beforeEach(async () => {
    jest.resetAllMocks()
    mockCommonBrokerMessageDataAgent = createMockInstance(CommonBrokerMessageDataAgent)
    mockCommonBrokerMessageDataAgent.findCommontoInternalMessage.mockReturnValue(null)
    mockCommonBrokerMessageDataAgent.findInternalToCommonlMessage.mockReturnValue(null)
    auditService = new AuditingService(mockCommonBrokerMessageDataAgent)
  })

  it('audit service handles auditing a message inbound from common broker', async () => {
    const status = STATUS.Processing

    await auditService.addCommontoInternalMessage(routingKey, messageProperties, messagePayload, STATUS.Processing)

    assertCommonToInteralMessageIsCorrect(status, null)
  })

  it('audit service handles auditing a message outbound to common broker', async () => {
    const status = STATUS.Processed

    await auditService.addInternalToCommonMessage(routingKey, messageProperties, messagePayload, status)

    const commonBrokerMessage: ICommonBrokerMessage =
      mockCommonBrokerMessageDataAgent.createInternalToCommonMessage.mock.calls[0][0]
    assertCommonBrokerMessageIsCorrect(commonBrokerMessage, status, null)
  })

  it('audit service handles an error object ', async () => {
    const status = STATUS.FailedServerError
    const errorMsg = 'invalid message'
    const errorObj = new MessageProcessingError(errorMsg)

    await auditService.addCommontoInternalMessage(routingKey, messageProperties, messagePayload, status, errorObj)

    assertCommonToInteralMessageIsCorrect(status, errorMsg)
  })

  /**
   * This test is for the following bug:
   * https://consensys-komgo.atlassian.net/browse/KOMGO-1977
   */
  it('audit service handles an error object with a circular dependency ', async () => {
    const errorMsg = 'invalid message'
    const status = STATUS.FailedServerError
    const errorObj: any = new MessageProcessingError(errorMsg)
    errorObj.circular = errorObj

    await auditService.addCommontoInternalMessage(routingKey, messageProperties, messagePayload, status, errorObj)

    assertCommonToInteralMessageIsCorrect(status, errorMsg)
  })

  it('audit service does not audit a message inbound from common broker that has already been audited ', async () => {
    const status = STATUS.FailedServerError

    // mock finding the message in the DB
    mockCommonBrokerMessageDataAgent.findCommontoInternalMessage.mockReturnValue({ message: 'hello' })

    await auditService.addCommontoInternalMessage(routingKey, messageProperties, messagePayload, status)

    expect(mockCommonBrokerMessageDataAgent.createCommonToInternalMessage).not.toBeCalled()
  })

  it('audit service does not audit a message outbound to common broker that has already been audited ', async () => {
    const status = STATUS.FailedServerError

    // mock finding the message in the DB
    mockCommonBrokerMessageDataAgent.findInternalToCommonlMessage.mockReturnValue({ message: 'hello' })

    await auditService.addInternalToCommonMessage(routingKey, messageProperties, messagePayload, status)

    expect(mockCommonBrokerMessageDataAgent.createInternalToCommonMessage).not.toBeCalled()
  })

  function assertCommonToInteralMessageIsCorrect(status: STATUS, errorMessage: string) {
    const commonBrokerMessage: ICommonBrokerMessage =
      mockCommonBrokerMessageDataAgent.createCommonToInternalMessage.mock.calls[0][0]

    assertCommonBrokerMessageIsCorrect(commonBrokerMessage, status, errorMessage)
  }

  function assertCommonBrokerMessageIsCorrect(
    commonBrokerMessage: ICommonBrokerMessage,
    status: STATUS,
    errorMessage: string
  ) {
    expect(commonBrokerMessage.status).toEqual(status)
    expect(commonBrokerMessage.routingKey).toEqual(routingKey)
    expect(commonBrokerMessage.messageProperties).toEqual(messageProperties)
    expect(commonBrokerMessage.messagePayload).toEqual(messagePayload)
    expect(commonBrokerMessage.error).toEqual(errorMessage)
  }
})
