import IMessagePublisher from '@komgo/messaging-library/dist/IMessagePublisher'
import MessagingFactory from '@komgo/messaging-library/dist/MessagingFactory'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { STATUS } from '../data-layer/models/ICommonBrokerMessage'
import ICommonMessagingAgent from '../messaging-layer/ICommonMessagingAgent'
import IEnvelopeAgent from '../messaging-layer/IEnvelopeAgent'
import { IAuditingService } from '../service-layer/IAuditingService'
import IBackoffTimer from '../util/IBackoffTimer'

import CommonToInternalForwardingService from './CommonToInternalForwardingService'
import { ICompanyRegistryAgent } from '../data-layer/data-agent/ICompanyRegistryAgent'
import IPollingServiceFactory from './IPollingServiceFactory'
import IService from './IService'
import CommonMessageReceived from '../messaging-layer/CommonMessageReceived'

const FROM_PUBLISHER_ID = 'from-publisher-id'
const POLLING_INTERVAL = 1
const STATIC_ID = 'company1'
let mockMessagingFactory: jest.Mocked<MessagingFactory>
const mockMessagePublisher: IMessagePublisher = {
  close: jest.fn(),
  publish: jest.fn(),
  publishCritical: jest.fn()
}

const asyncService: IService = {
  start: jest.fn(),
  stop: jest.fn()
}

const mockBackoffTimer: IBackoffTimer = {
  sleep: jest.fn(),
  reset: jest.fn()
}

const createPollingMock = jest.fn<IService>().mockImplementation(() => asyncService)

const mockPollingFactory: IPollingServiceFactory = {
  createPolling: createPollingMock
}

const getMessageMock = jest.fn().mockImplementation(() => undefined)
const ackMessageMock = jest.fn().mockImplementation(() => true)

const mockCommonMessagingAgent: ICommonMessagingAgent = {
  getMessage: getMessageMock,
  sendMessage: jest.fn(),
  ackMessage: ackMessageMock,
  getVhosts: jest.fn()
}

const mockEnvelopeAgent: IEnvelopeAgent = {
  encapsulate: jest.fn(),
  desencapsulate: jest.fn()
}

const companyRegistryMock: ICompanyRegistryAgent = {
  getEntryFromStaticId: jest.fn(),
  getMnidFromStaticId: jest.fn(),
  getPropertyFromMnid: jest.fn()
}

const publicKeys = [{ current: true }]
const emptyPublicKeys = [{ current: false }]

const desencapsulatedMock = {
  message: {
    messageType: 'RK'
  }
}

const desencapsulatedMockMissingType = {
  message: {
    otherValue: 'value'
  }
}

const mockAuditService: IAuditingService = {
  addCommontoInternalMessage: jest.fn(),
  addInternalToCommonMessage: jest.fn()
}

describe('CommonToInternalForwardingService', () => {
  let service: CommonToInternalForwardingService

  beforeEach(() => {
    mockMessagingFactory = createMockInstance(MessagingFactory)
    mockMessagingFactory.createRetryPublisher.mockImplementation(() => {
      return mockMessagePublisher
    })
    service = new CommonToInternalForwardingService(
      mockMessagingFactory,
      FROM_PUBLISHER_ID,
      POLLING_INTERVAL,
      STATIC_ID,
      mockPollingFactory,
      mockCommonMessagingAgent,
      mockEnvelopeAgent,
      companyRegistryMock,
      mockBackoffTimer,
      mockAuditService
    )
  })

  it('should create internal mq publisher', async () => {
    expect(mockMessagingFactory.createRetryPublisher).toHaveBeenCalledTimes(1)
  })

  it('should start polling at start', async () => {
    await service.start()
    expect(asyncService.start).toHaveBeenCalled()
  })

  it('should stop polling when stopping', async () => {
    await service.stop()
    expect(asyncService.stop).toHaveBeenCalled()
  })

  it('should not publish messages if there is nothing in the queue', async () => {
    await executePollingFunction()

    expect(mockCommonMessagingAgent.getMessage).toHaveBeenCalledWith(STATIC_ID)
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(0)
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(1)
    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(0)
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(0)
  })

  it('should publish message if there is one in the queue', async () => {
    mockGetMessageReturn()
    mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => desencapsulatedMock)
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)

    await executePollingFunction()

    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(1)
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(1)
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(0)
    // Expect reset twice because it will try to get next message after processing the current one
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(2)
  })

  it('should publish multiple messages if there are multiple in the queue', async () => {
    const numberOfMessages = 10
    mockGetMultipleMessageReturn(numberOfMessages)
    for (let i = 0; i < numberOfMessages; i++) {
      mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => desencapsulatedMock)
      companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)
    }

    await executePollingFunction()

    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(numberOfMessages)
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(numberOfMessages)
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(0)
    // Expect one more reset because it will try to get next message after processing the current one
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(numberOfMessages + 1)
  })

  it('should publish messages with correct fields', async () => {
    const numberOfMessages = 10
    mockGetMultipleMessageReturn(numberOfMessages)
    for (let i = 0; i < numberOfMessages; i++) {
      mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => desencapsulatedMock)
      companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)
    }

    await executePollingFunction()

    for (let i = 0; i < numberOfMessages; i++) {
      expect(mockMessagePublisher.publishCritical).toHaveBeenCalledWith(
        'RK',
        { messageType: 'RK' },
        {
          messageId: 'messageId' + i,
          correlationId: 'correlationId' + i,

          senderStaticId: 'senderStaticId',
          senderPlatform: 'vakt'
        }
      )
    }
  })

  it('should backoff if there is a connection error when getting a message', async () => {
    getMessageMock.mockImplementationOnce(() => {
      throw new Error()
    })

    await executePollingFunction()

    expect(mockCommonMessagingAgent.getMessage).toHaveBeenCalledWith(STATIC_ID)
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(1)
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(0)
    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(0)
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(0)
    expect(mockEnvelopeAgent.desencapsulate).toHaveBeenCalledTimes(0)
    expect(companyRegistryMock.getPropertyFromMnid).toHaveBeenCalledTimes(0)
  })

  it('should backoff if there is a connection error when getting the Properties from the MNID', async () => {
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => {
      throw new Error()
    })
    mockGetMessageReturn()

    await executePollingFunction()

    expect(mockCommonMessagingAgent.getMessage).toHaveBeenCalledWith(STATIC_ID)
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(1)
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(0)
    expect(mockEnvelopeAgent.desencapsulate).toHaveBeenCalledTimes(0)
    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(0)
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(0)
  })

  it('should backoff if there is a connection error when decrypting the message', async () => {
    mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => {
      throw new Error()
    })
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)
    mockGetMessageReturn()

    await executePollingFunction()

    expect(mockCommonMessagingAgent.getMessage).toHaveBeenCalledWith(STATIC_ID)
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(1)
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(0)
    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(0)
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(0)
  })

  it('should backoff if there is a connection error when publishing the message', async () => {
    mockMessagePublisher.publishCritical.mockImplementationOnce(() => {
      throw new Error()
    })
    mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => desencapsulatedMock)
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)
    mockGetMessageReturn()

    await executePollingFunction()

    expect(mockCommonMessagingAgent.getMessage).toHaveBeenCalledWith(STATIC_ID)
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(1)
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(0)
    expect(mockEnvelopeAgent.desencapsulate).toHaveBeenCalledTimes(1)
    expect(companyRegistryMock.getPropertyFromMnid).toHaveBeenCalledTimes(1)
    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(1)
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(0)
  })

  it('should reset backoff if there is a processing error when getting the properties from the MNID', async () => {
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => undefined)
    mockGetMessageReturn()

    await executePollingFunction()

    expect(mockCommonMessagingAgent.getMessage).toHaveBeenCalledWith(STATIC_ID)
    expect(companyRegistryMock.getPropertyFromMnid).toHaveBeenCalledTimes(1)
    expect(mockEnvelopeAgent.desencapsulate).toHaveBeenCalledTimes(0)
    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(0)
    // check backoff logic
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(0)
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(2)
    // message is acked if there is a processing error
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(1)
  })

  it('should reset backoff if there is a processing error when getting empty Public Keys', async () => {
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => emptyPublicKeys)
    mockGetMessageReturn()

    await executePollingFunction()

    expect(mockCommonMessagingAgent.getMessage).toHaveBeenCalledWith(STATIC_ID)
    expect(companyRegistryMock.getPropertyFromMnid).toHaveBeenCalledTimes(1)
    expect(mockEnvelopeAgent.desencapsulate).toHaveBeenCalledTimes(0)
    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(0)
    // check backoff logic
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(0)
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(2)
    // message is acked if there is a processing error
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(1)
  })

  it('should reset backoff if there is a processing error when decrypting the message', async () => {
    mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => null)
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)
    mockGetMessageReturn()

    await executePollingFunction()

    expect(mockCommonMessagingAgent.getMessage).toHaveBeenCalledWith(STATIC_ID)
    expect(companyRegistryMock.getPropertyFromMnid).toHaveBeenCalledTimes(1)
    expect(mockEnvelopeAgent.desencapsulate).toHaveBeenCalledTimes(1)
    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(0)
    // check backoff logic
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(0)
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(2)
    // message is acked if there is a processing error
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(1)
  })

  it('should reset backoff if there is a processing error when decrypting the a malformed message', async () => {
    mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => desencapsulatedMockMissingType)
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)
    mockGetMessageReturn()

    await executePollingFunction()

    expect(mockCommonMessagingAgent.getMessage).toHaveBeenCalledWith(STATIC_ID)
    expect(companyRegistryMock.getPropertyFromMnid).toHaveBeenCalledTimes(1)
    expect(mockEnvelopeAgent.desencapsulate).toHaveBeenCalledTimes(1)
    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(0)
    // check backoff logic
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(0)
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(2)
    // message is acked if there is a processing error
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(1)
  })

  it('should audit a message inbound from the common broker', async () => {
    mockGetMessageReturn()
    mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => desencapsulatedMock)
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)

    await executePollingFunction()

    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(1)

    const initialStatus = mockAuditService.addCommontoInternalMessage.mock.calls[0][3]
    const finishedStatus = mockAuditService.addCommontoInternalMessage.mock.calls[1][3]
    expect(mockAuditService.addCommontoInternalMessage).toHaveBeenCalledTimes(2)
    expect(initialStatus).toBe(STATUS.Decrypted)
    expect(finishedStatus).toBe(STATUS.Processed)
  })

  it('should audit a message as processed and a subsequent failed status if the ack fails', async () => {
    mockGetMessageReturn()
    mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => desencapsulatedMock)
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)

    mockCommonMessagingAgent.ackMessage.mockImplementationOnce(() => {
      throw new Error()
    })
    await executePollingFunction()

    expect(mockMessagePublisher.publishCritical).toHaveBeenCalledTimes(1)
    expect(mockCommonMessagingAgent.ackMessage).toHaveBeenCalledTimes(1)

    const initialStatus = mockAuditService.addCommontoInternalMessage.mock.calls[0][3]
    const processsedStatus = mockAuditService.addCommontoInternalMessage.mock.calls[1][3]
    const errorStatus = mockAuditService.addCommontoInternalMessage.mock.calls[2][3]
    expect(mockAuditService.addCommontoInternalMessage).toHaveBeenCalledTimes(3)
    expect(initialStatus).toBe(STATUS.Decrypted)
    expect(processsedStatus).toBe(STATUS.Processed)
    expect(errorStatus).toBe(STATUS.FailedServerError)
  })

  it('should audit a message that fails to connect to the api-signer', async () => {
    mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => {
      throw new Error()
    })
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)
    mockGetMessageReturn()

    await executePollingFunction()

    const status = mockAuditService.addCommontoInternalMessage.mock.calls[0][3]
    expect(mockAuditService.addCommontoInternalMessage).toHaveBeenCalledTimes(1)
    expect(status).toBe(STATUS.FailedServerError)
  })

  it('should audit a message that fails to decrypt', async () => {
    mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => {
      return null
    })
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)
    mockGetMessageReturn()

    await executePollingFunction()

    const status = mockAuditService.addCommontoInternalMessage.mock.calls[0][3]
    const error = mockAuditService.addCommontoInternalMessage.mock.calls[0][4]
    expect(mockAuditService.addCommontoInternalMessage).toHaveBeenCalledTimes(1)
    expect(status).toBe(STATUS.FailedProcessing)
    // expect(error).toBeInstanceOf(MessageProcessingError)// TODO: https://consensys-komgo.atlassian.net/browse/KOMGO-2509
  })

  it('should handle exception if fails to write audit on connection error', async () => {
    mockEnvelopeAgent.desencapsulate.mockImplementationOnce(() => {
      throw new Error()
    })
    mockAuditService.addCommontoInternalMessage.mockImplementationOnce(() => {
      throw new Error()
    })
    companyRegistryMock.getPropertyFromMnid.mockImplementationOnce(() => publicKeys)
    mockGetMessageReturn()

    await executePollingFunction()

    expect(mockAuditService.addCommontoInternalMessage).toHaveBeenCalledTimes(1)
    const status = mockAuditService.addCommontoInternalMessage.mock.calls[0][3]
    expect(status).toBe(STATUS.FailedServerError)
    expect(mockBackoffTimer.sleep).toHaveBeenCalledTimes(1)
    expect(mockBackoffTimer.reset).toHaveBeenCalledTimes(0)
  })

  async function executePollingFunction() {
    const asyncFunction = createPollingMock.mock.calls[0][0]
    const endFunction = jest.fn()

    await asyncFunction(endFunction)
  }

  function mockGetMessageReturn(nonce: string = '') {
    const receivedMessage = new CommonMessageReceived(
      'komgo.internal',
      {
        payload: '{}'
      },
      {
        messageId: 'messageId' + nonce,
        correlationId: 'correlationId' + nonce,
        recipientMnid: 'recipientMnid',
        senderMnid: 'senderMnid',
        senderStaticId: 'senderStaticId',
        senderPlatform: 'vakt'
      }
    )
    getMessageMock.mockImplementationOnce(() => {
      return receivedMessage
    })
  }

  function mockGetMultipleMessageReturn(numberOfMessages: number) {
    for (let i = 0; i < numberOfMessages; i++) {
      mockGetMessageReturn(i + '')
    }
  }
})
