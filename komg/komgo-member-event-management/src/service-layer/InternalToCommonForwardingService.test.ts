import IConsumerWatchdog from '@komgo/messaging-library/dist/IConsumerWatchdog'
import MessagingFactory from '@komgo/messaging-library/dist/MessagingFactory'
import { IMessageOptions, IMessageReceived } from '@komgo/messaging-library/dist/types'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import ICommonMessagingAgent from '../messaging-layer/ICommonMessagingAgent'
import IEnvelopeAgent from '../messaging-layer/IEnvelopeAgent'

import { IAuditingService } from './IAuditingService'
import InternalToCommonForwardingService from './InternalToCommonForwardingService'
import { STATUS } from '../data-layer/models/ICommonBrokerMessage'
import { MessageTooLargeError } from '../messaging-layer/MessageTooLargeError'
import { ICompanyRegistryAgent } from '../data-layer/data-agent/ICompanyRegistryAgent'

const COMPANY_STATIC_ID = 'companyStaticId'

const getMessageMock = jest.fn().mockImplementation(() => undefined)
const ackMessageMock = jest.fn().mockImplementation(() => true)

const mockConsumer: IConsumerWatchdog = {
  listen: jest.fn(),
  listenMultiple: jest.fn(),
  close: jest.fn()
}

const mockEnvelopeAgent: IEnvelopeAgent = {
  encapsulate: jest.fn(),
  desencapsulate: jest.fn()
}

const mockCommonMessagingAgent: ICommonMessagingAgent = {
  getMessage: getMessageMock,
  sendMessage: jest.fn(),
  ackMessage: ackMessageMock,
  getVhosts: jest.fn()
}

const companyRegistryMock: ICompanyRegistryAgent = {
  getEntryFromStaticId: jest.fn(),
  getMnidFromStaticId: jest.fn(),
  getPropertyFromMnid: jest.fn()
}

const recipientENSEntryVAKT = {
  vaktMessagingPubKeys: [{}],
  vaktMnid: 'vaktMnid'
}

const recipientENSEntryAsKomgoMember = {
  komgoMessagingPubKeys: [{}],
  komgoMnid: 'komgoMnid',
  isMember: true
}

const recipientENSEntryAsNonKomgoMember = {
  komgoMessagingPubKeys: [{}],
  komgoMnid: 'komgoMnid',
  isMember: false
}

const recipientENSEntryAsUndefinedKomgoMember = {
  komgoMessagingPubKeys: [{}],
  komgoMnid: 'komgoMnid'
}

const encapsulatedMessage = 'encryptedMessage'
const WATCHDOG_INTERVAL_MS = 0

const mockAuditService: IAuditingService = {
  addCommontoInternalMessage: jest.fn(),
  addInternalToCommonMessage: jest.fn()
}

describe('InternalToCommonForwardingService', () => {
  let service: InternalToCommonForwardingService
  let mockMessagingFactory: jest.Mocked<MessagingFactory>

  beforeEach(() => {
    jest.resetAllMocks()
    mockMessagingFactory = createMockInstance(MessagingFactory)
    mockMessagingFactory.createConsumerWatchdog.mockImplementation(() => {
      return mockConsumer
    })
    mockMessagingFactory.createRetryPublisher.mockImplementation(() => {
      return { register: jest.fn() }
    })
    service = new InternalToCommonForwardingService(
      mockMessagingFactory,
      'outgoing-publisher-id',
      'outboundroutingkey',
      'outboundvaktexchange',
      'outboundmonitoringexchange',
      'consumerId',
      mockCommonMessagingAgent,
      mockEnvelopeAgent,
      companyRegistryMock,
      WATCHDOG_INTERVAL_MS,
      mockAuditService,
      COMPANY_STATIC_ID
    )
  })

  it('should create consumer', async () => {
    expect(mockMessagingFactory.createConsumerWatchdog).toHaveBeenCalledTimes(1)
  })

  it('consume messages at start', async () => {
    await service.start()
    expect(mockConsumer.listen).toHaveBeenCalledTimes(1)
  })

  it('should close consumer at stop', async () => {
    await service.stop()
    expect(mockConsumer.close).toHaveBeenCalledTimes(1)
  })

  it('should publish a VAKT message in common mq', async () => {
    companyRegistryMock.getMnidFromStaticId.mockReturnValueOnce('senderMnid')
    await service.start()
    const handleIncomingMessage = mockConsumer.listen.mock.calls[0][2]
    const options: IMessageOptions = {
      messageId: 'messageId',
      correlationId: 'correlationId',
      recipientStaticId: 'recipientStaticId',
      recipientPlatform: 'vakt',
      senderStaticId: COMPANY_STATIC_ID
    }

    mockEnvelopeAgent.encapsulate.mockImplementation(() => encapsulatedMessage)
    const receivedMessage = {
      ack: jest.fn(),
      requeue: jest.fn(),
      reject: jest.fn(),
      options
    }
    companyRegistryMock.getEntryFromStaticId.mockImplementation(() => recipientENSEntryVAKT)

    await handleIncomingMessage(receivedMessage)
    expect(mockCommonMessagingAgent.sendMessage).toHaveBeenCalledTimes(1)
    expect(receivedMessage.ack).toHaveBeenCalledTimes(1)

    expect(mockCommonMessagingAgent.sendMessage).toHaveBeenCalledWith(
      'outboundroutingkey',
      'outboundvaktexchange',
      'encryptedMessage',
      {
        messageId: 'messageId',
        correlationId: 'correlationId',
        recipientMnid: 'vaktMnid',
        senderMnid: 'senderMnid',
        senderStaticId: COMPANY_STATIC_ID
      }
    )
  })

  it('should publish a KOMGO message in common mq', async () => {
    companyRegistryMock.getMnidFromStaticId.mockReturnValueOnce('senderMnid')
    await service.start()
    const handleIncomingMessage = mockConsumer.listen.mock.calls[0][2]
    const options: IMessageOptions = {
      messageId: 'messageId',
      correlationId: 'correlationId',
      recipientStaticId: 'recipientStaticId',
      senderStaticId: COMPANY_STATIC_ID
    }

    mockEnvelopeAgent.encapsulate.mockImplementation(() => encapsulatedMessage)
    const receivedMessage = {
      ack: jest.fn(),
      requeue: jest.fn(),
      reject: jest.fn(),
      options
    }
    companyRegistryMock.getEntryFromStaticId.mockImplementation(() => recipientENSEntryAsKomgoMember)

    await handleIncomingMessage(receivedMessage)
    expect(mockCommonMessagingAgent.sendMessage).toHaveBeenCalledTimes(1)
    expect(receivedMessage.ack).toHaveBeenCalledTimes(1)

    expect(mockCommonMessagingAgent.sendMessage).toHaveBeenCalledWith(
      'outboundroutingkey',
      'komgoMnid-EXCHANGE',
      'encryptedMessage',
      {
        messageId: 'messageId',
        correlationId: 'correlationId',
        recipientMnid: 'komgoMnid',
        senderMnid: 'senderMnid',
        senderPlatform: 'komgo',
        senderStaticId: COMPANY_STATIC_ID
      }
    )
  })

  it('should publish a MONITORING message in common mq', async () => {
    await service.start()
    const handleIncomingMessage = mockConsumer.listen.mock.calls[0][2]
    const options: IMessageOptions = {
      messageId: 'messageId',
      correlationId: 'correlationId',
      recipientStaticId: 'recipientStaticId',
      senderStaticId: COMPANY_STATIC_ID,
      recipientPlatform: 'monitoring'
    }

    const receivedMessage = {
      ack: jest.fn(),
      requeue: jest.fn(),
      reject: jest.fn(),
      options,
      content: 'message',
      routingKey: 'komgo.monitoring'
    }
    companyRegistryMock.getEntryFromStaticId.mockImplementation(() => recipientENSEntryAsKomgoMember)

    await handleIncomingMessage(receivedMessage)
    expect(mockCommonMessagingAgent.sendMessage).toHaveBeenCalledTimes(1)
    expect(receivedMessage.ack).toHaveBeenCalledTimes(1)

    expect(mockCommonMessagingAgent.sendMessage).toHaveBeenCalledWith(
      'komgo.monitoring',
      'outboundmonitoringexchange',
      'message',
      {
        messageId: 'messageId',
        correlationId: 'correlationId',
        senderStaticId: COMPANY_STATIC_ID
      }
    )
  })

  it('should publish a EMAIL-NOTIFICATION message in common mq', async () => {
    await service.start()
    const handleIncomingMessage = mockConsumer.listen.mock.calls[0][2]
    const options: IMessageOptions = {
      messageId: 'messageId',
      correlationId: 'correlationId',
      recipientStaticId: 'recipientStaticId',
      senderStaticId: COMPANY_STATIC_ID,
      recipientPlatform: 'email-notification'
    }

    const receivedMessage = {
      ack: jest.fn(),
      requeue: jest.fn(),
      reject: jest.fn(),
      options,
      content: 'message',
      routingKey: 'komgo.email-notification'
    }
    companyRegistryMock.getEntryFromStaticId.mockImplementation(() => recipientENSEntryAsKomgoMember)

    await handleIncomingMessage(receivedMessage)
    expect(mockCommonMessagingAgent.sendMessage).toHaveBeenCalledTimes(1)
    expect(receivedMessage.ack).toHaveBeenCalledTimes(1)

    expect(mockCommonMessagingAgent.sendMessage).toHaveBeenCalledWith(
      'komgo.email-notification',
      'outboundmonitoringexchange',
      'message',
      {
        messageId: 'messageId',
        correlationId: 'correlationId',
        senderStaticId: COMPANY_STATIC_ID
      }
    )
  })

  it('should reject message when the recipient is not a member of Komgo', async () => {
    const receivedMessage: IMessageReceived = await setupHandleIncomingMessage(
      recipientENSEntryAsNonKomgoMember,
      'komgo'
    )

    expect(receivedMessage.requeue).toHaveBeenCalledTimes(0)
    expect(receivedMessage.reject).toHaveBeenCalledTimes(1)
  })

  it('should reject message when is unknown if the recipient is a member of Komgo', async () => {
    const receivedMessage: IMessageReceived = await setupHandleIncomingMessage(
      recipientENSEntryAsUndefinedKomgoMember,
      'komgo'
    )

    expect(receivedMessage.requeue).toHaveBeenCalledTimes(0)
    expect(receivedMessage.reject).toHaveBeenCalledTimes(1)
  })

  it('should audit a message outbound to the common broker', async () => {
    await setupHandleIncomingMessage(recipientENSEntryVAKT)

    const initialStatus = mockAuditService.addInternalToCommonMessage.mock.calls[0][3]
    const finishedStatus = mockAuditService.addInternalToCommonMessage.mock.calls[1][3]
    expect(mockAuditService.addInternalToCommonMessage).toHaveBeenCalledTimes(2)
    expect(initialStatus).toBe(STATUS.Processing)
    expect(finishedStatus).toBe(STATUS.Processed)
  })

  it('should audit a failed message if Company Registry configuration is invalid', async () => {
    await setupHandleIncomingMessage(null)

    const status = mockAuditService.addInternalToCommonMessage.mock.calls[0][3]
    const error = mockAuditService.addInternalToCommonMessage.mock.calls[0][4]
    expect(mockAuditService.addInternalToCommonMessage).toHaveBeenCalledTimes(1)
    expect(status).toBe(STATUS.FailedServerError)
    // expect(error).toBeInstanceOf(ServerError) // TODO: https://consensys-komgo.atlassian.net/browse/KOMGO-2509
  })

  it('should audit a failed message if it an exception is thrown during encryption', async () => {
    companyRegistryMock.getMnidFromStaticId.mockReturnValueOnce('senderMnid')
    await service.start()
    const handleIncomingMessage = mockConsumer.listen.mock.calls[0][2]
    const options: IMessageOptions = {
      recipientStaticId: 'recipientStaticId',
      recipientPlatform: 'vakt'
    }

    mockEnvelopeAgent.encapsulate.mockImplementationOnce(() => {
      throw Error()
    })
    const receivedMessage = { ack: jest.fn(), requeue: jest.fn(), reject: jest.fn(), options }
    companyRegistryMock.getEntryFromStaticId.mockImplementationOnce(() => entryFromStaticId)
    await handleIncomingMessage(receivedMessage)

    const status = mockAuditService.addInternalToCommonMessage.mock.calls[0][3]
    expect(mockAuditService.addInternalToCommonMessage).toHaveBeenCalledTimes(1)
    expect(status).toBe(STATUS.FailedServerError)
    expect(receivedMessage.ack).toHaveBeenCalledTimes(0)
    expect(receivedMessage.requeue).toHaveBeenCalledTimes(1)
  })

  it('should requeue message when there is an error writing an error case for auditing', async () => {
    mockAuditService.addInternalToCommonMessage.mockImplementationOnce(() => {
      throw new Error()
    })

    const receivedMessage: IMessageReceived = await setupHandleIncomingMessage(null)

    expect(receivedMessage.requeue).toHaveBeenCalledTimes(1)
    expect(receivedMessage.reject).toHaveBeenCalledTimes(0)
  })

  it('should reject message when there is a message too large from API-Signer', async () => {
    mockEnvelopeAgent.encapsulate.mockImplementationOnce(() => {
      throw new MessageTooLargeError('Too large')
    })

    const receivedMessage: IMessageReceived = await setupHandleIncomingMessage(recipientENSEntryVAKT)

    expect(receivedMessage.requeue).toHaveBeenCalledTimes(0)
    expect(receivedMessage.reject).toHaveBeenCalledTimes(1)
  })

  it('should reject message when there is a message too large from Common-MQ', async () => {
    mockCommonMessagingAgent.sendMessage.mockImplementationOnce(() => {
      throw new MessageTooLargeError('Too large')
    })

    const receivedMessage: IMessageReceived = await setupHandleIncomingMessage(recipientENSEntryVAKT)

    expect(receivedMessage.requeue).toHaveBeenCalledTimes(0)
    expect(receivedMessage.reject).toHaveBeenCalledTimes(1)
  })

  it('should requeue message when there is a technical error', async () => {
    mockCommonMessagingAgent.sendMessage.mockImplementationOnce(() => {
      throw new Error('Some error')
    })

    const receivedMessage: IMessageReceived = await setupHandleIncomingMessage(recipientENSEntryVAKT)

    expect(receivedMessage.requeue).toHaveBeenCalledTimes(1)
    expect(receivedMessage.reject).toHaveBeenCalledTimes(0)
  })

  const setupHandleIncomingMessage = async (entryFromStaticId, recipientPlatform = 'vakt') => {
    companyRegistryMock.getMnidFromStaticId.mockReturnValueOnce('senderMnid')
    await service.start()
    const handleIncomingMessage = mockConsumer.listen.mock.calls[0][2]
    const options: IMessageOptions = {
      recipientStaticId: 'recipientStaticId',
      recipientPlatform
    }

    mockEnvelopeAgent.encapsulate.mockImplementationOnce(() => encapsulatedMessage)
    const receivedMessage: IMessageReceived = {
      ack: jest.fn(),
      reject: jest.fn(),
      requeue: jest.fn(),
      options,
      content: {
        data: true
      },
      routingKey: 'routingKey'
    }
    companyRegistryMock.getEntryFromStaticId.mockImplementationOnce(() => entryFromStaticId)
    await handleIncomingMessage(receivedMessage)
    return receivedMessage
  }
})
