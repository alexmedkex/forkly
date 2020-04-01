import { AMQPUtility, ConsumerMicroservice } from '@komgo/integration-test-utilities'
import { MessagingFactory } from '@komgo/messaging-library'
import * as crypto from 'crypto'
import 'reflect-metadata'

import { CommonBrokerMessageDataAgent } from '../../src/data-layer/data-agent/CommonBrokerMessageDataAgent'
import { ICompanyRegistryAgent } from '../../src/data-layer/data-agent/ICompanyRegistryAgent'
import { STATUS } from '../../src/data-layer/models/ICommonBrokerMessage'
import { iocContainer } from '../../src/inversify/ioc'
import { TYPES } from '../../src/inversify/types'
import CommonMessagingAgent from '../../src/messaging-layer/CommonMessagingAgent'
import { IEncryptedEnvelope } from '../../src/messaging-layer/types'
import CommonToInternalForwardingService from '../../src/service-layer/CommonToInternalForwardingService'
import IService from '../../src/service-layer/IService'

import IntegrationEnvironment from './utils/IntegrationEnvironment'
import {
  mockPassthroughAnyRequest,
  mockSuccessAPISigner,
  mockSuccessAPIRegistry
} from './utils/CommonToInternal.mockutils'
import { generateRandomString, sleep } from './utils/utils'
const mockMessageEncryptedContent: IEncryptedEnvelope = {
  message: 'encrypted,sealed,message'
}

// create a message with a random payload of 10Mbytes
const TEN_MEGABYTES = 10 * 1024 * 1024
const mockBigMessageEncryptedContent: IEncryptedEnvelope = {
  message: (() => {
    let msg: string = ''
    while (msg.length < TEN_MEGABYTES) msg += crypto.randomBytes(1024).toString('hex')
    return msg
  })()
}

const mockClearMessage = {
  messageType: 'routingKey',
  content: 'content inside'
}

const mockOptions = (customMessageId: string, mockedCorrelationId: string, iEnv: IntegrationEnvironment) => {
  return {
    messageId: customMessageId,
    correlationId: mockedCorrelationId,
    requestId: expect.any(String)
  }
}

const customMessageOptions = (customMessageId: string, mockedCorrelationId: string, iEnv: IntegrationEnvironment) => {
  return {
    messageId: customMessageId,
    correlationId: mockedCorrelationId,
    recipientMnid: iEnv.mockedIds.recipientMNID,
    senderMnid: iEnv.mockedIds.senderMNID,
    recipientStaticId: iEnv.mockedIds.companyStaticId
  }
}

// to allow time for RabbitMQ to start
jest.setTimeout(90000)

/**
 * This integration test is using 1 real RabbitMQ for both Common and Internal Brokers (naming is different to avoid conflicts)
 * API Registry and API Signer are mocked.
 */
describe('CI ONLY - Common to Internal MQ inbound messages', () => {
  let iEnv: IntegrationEnvironment
  let service: IService
  let intraMessaging: CommonMessagingAgent
  let dummyMicroservice: ConsumerMicroservice
  let amqpUtility: AMQPUtility

  let messageDataAgent: CommonBrokerMessageDataAgent

  let mockedMessageId1: string
  let mockedCorrelationId: string

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()
    amqpUtility = new AMQPUtility(iEnv.amqpConfig)
    await iEnv.beforeAll()
    messageDataAgent = iocContainer.get(TYPES.CommonBrokerMessageDataAgent)
  })

  beforeEach(async () => {
    await iEnv.beforeEach()
    dummyMicroservice = new ConsumerMicroservice(iEnv.mockedIds.eventFromPublisherId)
    await dummyMicroservice.beforeEach()

    mockedMessageId1 = generateRandomString(7, 'messageId1-')
    mockedCorrelationId = generateRandomString(7, 'correlationId-')

    // create messaging instances for the test
    intraMessaging = new CommonMessagingAgent(
      iEnv.amqpConfig.httpUrl,
      iEnv.amqpConfig.username,
      iEnv.amqpConfig.password,
      iocContainer.get<number>('max-content-length'),
      iocContainer.get<number>('request-timeout'),
      iocContainer.get<ICompanyRegistryAgent>(TYPES.CompanyRegistryAgent)
    )

    // rebind services to update the Mocked IDs
    iocContainer
      .rebind(TYPES.MessagingFactory)
      .toConstantValue(
        new MessagingFactory(
          iEnv.amqpConfig.host,
          iEnv.amqpConfig.username,
          iEnv.amqpConfig.password,
          iocContainer.get<IRequestIdHandler>(TYPES.RequestIdHandler)
        )
      )
    iocContainer.rebind(TYPES.CommonMessagingAgent).to(CommonMessagingAgent)
    iocContainer.rebind<IService>(TYPES.CommonToInternalForwardingService).to(CommonToInternalForwardingService)

    service = iocContainer.get<IService>(TYPES.CommonToInternalForwardingService)
    await service.start()
  })

  it('10M message should be decrypted, verified and forwarded to Internal Broker', async done => {
    // Set api-registry and api-signer REST APIs with mocked responses
    mockSuccessAPIRegistry(iEnv)
    mockSuccessAPISigner(iEnv, mockClearMessage)
    mockPassthroughAnyRequest(iEnv)

    await sendMessageToCommonBroker(mockedMessageId1, mockBigMessageEncryptedContent)
    await sleep(500) // give time to process the message

    // callback to verify the messages were audited once the Dummy microservice finishes its verifications
    const verifyMessagesAuditedCallback: jest.DoneCallback = async () => {
      await verifyMessageAudited(mockedMessageId1, STATUS.Decrypted)
      await verifyMessageAudited(mockedMessageId1, STATUS.Processed)
      // end test
      done()
    }
    verifyMessagesAuditedCallback.fail = done.fail

    // Consume the message decrypted by event-mgnt service from the Internal MQ
    await verifyReceivedMessageInDummyMicroservice(verifyMessagesAuditedCallback, mockedMessageId1)
  })

  afterEach(async () => {
    await service.stop()
    await dummyMicroservice.afterEach()
    await iEnv.afterEach()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  async function sendMessageToCommonBroker(customMessageId: string, customMessageContent?: IEncryptedEnvelope) {
    await intraMessaging.sendMessage(
      // should succeed
      'komgo.internal',
      iEnv.mockedIds.recipientMNID + '-EXCHANGE',
      customMessageContent ? customMessageContent : mockMessageEncryptedContent,
      customMessageOptions(customMessageId, mockedCorrelationId, iEnv)
    )
  }

  async function verifyReceivedMessageInDummyMicroservice(done: jest.DoneCallback, customMessageId: string) {
    await dummyMicroservice.expectMessage(
      mockClearMessage.messageType,
      {
        routingKey: mockClearMessage.messageType,
        content: mockClearMessage,
        options: mockOptions(customMessageId, mockedCorrelationId, iEnv),
        hasError: false
      },
      done
    )
  }

  async function verifyMessageAudited(messageId: string, status: STATUS) {
    // Check message audited
    const decryptedMessage = await messageDataAgent.findCommontoInternalMessage({
      'messageProperties.messageId': messageId,
      status
    })
    expect(decryptedMessage).not.toBe(null)
    expect(decryptedMessage.messageProperties.messageId).toBe(messageId)
    expect(decryptedMessage.status).toBe(status)
  }
})
