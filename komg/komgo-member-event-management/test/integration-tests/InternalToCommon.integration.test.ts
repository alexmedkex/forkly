import { AMQPUtility, PublisherMicroservice } from '@komgo/integration-test-utilities'
import { MessagingFactory, IRequestIdHandler } from '@komgo/messaging-library'
import 'reflect-metadata'
import * as waitForExpect from 'wait-for-expect'

import { CommonBrokerMessageDataAgent } from '../../src/data-layer/data-agent/CommonBrokerMessageDataAgent'
import CompanyRegistryAgent from '../../src/data-layer/data-agent/CompanyRegistryAgent'
import { STATUS } from '../../src/data-layer/models/ICommonBrokerMessage'
import { iocContainer } from '../../src/inversify/ioc'
import { TYPES } from '../../src/inversify/types'
import CommonMessageReceived from '../../src/messaging-layer/CommonMessageReceived'
import CommonMessagingAgent from '../../src/messaging-layer/CommonMessagingAgent'
import { HEADERS } from '../../src/messaging-layer/consts'
import { IEncryptedEnvelope } from '../../src/messaging-layer/types'
import InternalToCommonForwardingService from '../../src/service-layer/InternalToCommonForwardingService'
import IService from '../../src/service-layer/IService'
import { REQUEST_ID_HEADER } from '../../src/util/RequestIdHandler'

import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { generateRandomString, sleep } from './utils/utils'

const mockMessageEncryptedContent: IEncryptedEnvelope = {
  message: 'encrypted,sealed,message'
}

const mockClearMessage = {
  messageType: 'routingKey',
  content: 'content inside'
}

const DELAY_REQUEST_ID_MOCK = 1000
// to allow time for RabbitMQ to start
jest.setTimeout(90000)

/**
 * This integration test is using 1 real RabbitMQ for both Common and Internal Brokers (naming is different to avoid conflicts)
 * API Registry and API Signer are mocked.
 */
describe('Internal to Common MQ outbound messages', () => {
  let iEnv: IntegrationEnvironment
  let service: IService
  let intraMessaging: CommonMessagingAgent
  let publisherMicroservice: PublisherMicroservice
  let amqpUtility: AMQPUtility
  const testApiRegistryBaseUrl = 'http://api-test-registry'

  let messageDataAgent: CommonBrokerMessageDataAgent

  let mockedMessageId1
  let mockedMessageId2
  let mockedCorrelationId

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()
    amqpUtility = new AMQPUtility(iEnv.amqpConfig)
    await iEnv.beforeAll()
    messageDataAgent = iocContainer.get(TYPES.CommonBrokerMessageDataAgent)
  })

  beforeEach(async () => {
    await iEnv.beforeEach()
    publisherMicroservice = new PublisherMicroservice(iEnv.mockedIds.eventToPublisherId)
    await publisherMicroservice.beforeEach()

    mockedMessageId1 = generateRandomString(7, 'messageId1-')
    mockedMessageId2 = generateRandomString(7, 'messageId2-')
    mockedCorrelationId = generateRandomString(7, 'correlationId-')

    // create messaging instances for the test
    intraMessaging = new CommonMessagingAgent(
      iEnv.amqpConfig.httpUrl,
      iEnv.amqpConfig.username,
      iEnv.amqpConfig.password,
      iocContainer.get<number>('max-content-length'),
      iocContainer.get<number>('request-timeout'),
      new CompanyRegistryAgent(testApiRegistryBaseUrl, iocContainer.get<IRequestIdHandler>(TYPES.RequestIdHandler))
    )
    mockTestApiRegistry()

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
    iocContainer.rebind<IService>(TYPES.InternalToCommonForwardingService).to(InternalToCommonForwardingService)

    service = iocContainer.get<IService>(TYPES.InternalToCommonForwardingService)
    await service.start()
  })

  /**
   * Given:
   * A message is received in Internal MQ
   *
   * When:
   * should consume the message, encrypt and send to the Common MQ queue of the recipient
   *
   * Then:
   * encrypted message should be in the recipient's queue
   * The message should be audited to the database in Processing and Processed status
   */
  it('should be encryped and forwarded to Common Broker', async () => {
    mockSuccessAPIRegistryKomgoThenMnid()
    mockSuccessAPISigner()
    mockPassthroughAnyRequest()

    await publisherMicroservice.publish(mockClearMessage.messageType, mockClearMessage, {
      messageId: mockedMessageId1,
      correlationId: mockedCorrelationId,
      recipientMnid: iEnv.mockedIds.recipientMNID,
      senderMnid: iEnv.mockedIds.senderMNID,
      recipientStaticId: iEnv.mockedIds.companyStaticId
    })

    await waitForExpect(async () => {
      const receivedMessage: CommonMessageReceived = await intraMessaging.getMessage(iEnv.mockedIds.companyStaticId)

      expect(receivedMessage).toBeDefined()

      const payload = JSON.parse(receivedMessage.message.payload)
      expect(payload.message).toEqual(mockMessageEncryptedContent)

      expect(receivedMessage.properties.messageId).toEqual(mockedMessageId1)
      expect(receivedMessage.properties.correlationId).toEqual(mockedCorrelationId)
      expect(receivedMessage.properties.recipientMnid).toEqual(iEnv.mockedIds.recipientMNID)
      expect(receivedMessage.properties.senderMnid).toEqual(iEnv.mockedIds.senderMNID)
      expect(receivedMessage.properties.senderPlatform).toEqual('komgo')

      await intraMessaging.ackMessage()
      await verifyMessageAudited(mockedMessageId1, STATUS.Processing)
      await verifyMessageAudited(mockedMessageId1, STATUS.Processed)
    })
  })

  /**
   * Given:
   * Post a messsage in internal-mq without `messageId`
   *
   * When:
   * should consume the message, encrypt and send to the Common MQ queue of the recipient
   *
   * Then:
   * encrypted message should be in the recipient's queue with an generated ID
   * The message should be audited to the database in Processing and Processed status
   */
  it('should be encryped and forwarded to Common Broker with generated ID', async () => {
    mockSuccessAPIRegistryKomgoThenMnid()
    mockSuccessAPISigner()
    mockPassthroughAnyRequest()

    await publisherMicroservice.publish(mockClearMessage.messageType, mockClearMessage, {
      recipientMnid: iEnv.mockedIds.recipientMNID,
      senderMnid: iEnv.mockedIds.senderMNID,
      recipientStaticId: iEnv.mockedIds.companyStaticId
    })

    await waitForExpect(async () => {
      const receivedMessage: CommonMessageReceived = await intraMessaging.getMessage(iEnv.mockedIds.companyStaticId)

      expect(receivedMessage).toBeDefined()

      const payload = JSON.parse(receivedMessage.message.payload)
      expect(payload.message).toEqual(mockMessageEncryptedContent)

      expect(receivedMessage.properties.messageId).toBeDefined()
      expect(receivedMessage.properties.correlationId).toBeUndefined()
      expect(receivedMessage.properties.recipientMnid).toEqual(iEnv.mockedIds.recipientMNID)
      expect(receivedMessage.properties.senderMnid).toEqual(iEnv.mockedIds.senderMNID)
      expect(receivedMessage.properties.senderPlatform).toEqual('komgo')

      await intraMessaging.ackMessage()

      await verifyMessageAudited(receivedMessage.properties.messageId, STATUS.Processing)
      verifyMessageAudited(receivedMessage.properties.messageId, STATUS.Processed)
    })
  })

  /**
   * Given:
   * A message is received in Internal MQ with VAKT as platform
   *
   * When:
   * should consume the message, encrypt and send to the Common MQ queue of the outbound VAKT
   *
   * Then:
   * encrypted message should be in the VAKT queue
   * The message should be audited to the database in Processing and Processed status
   */
  it('should be encryped and forwarded to Common Broker in VAKT queue', async () => {
    mockSuccessAPIRegistryVakt()
    mockSuccessAPISigner()
    mockPassthroughAnyRequest()

    await publisherMicroservice.publish(mockClearMessage.messageType, mockClearMessage, {
      messageId: mockedMessageId1,
      correlationId: mockedCorrelationId,
      recipientMnid: iEnv.mockedIds.recipientMNID,
      senderMnid: iEnv.mockedIds.senderMNID,
      recipientStaticId: iEnv.mockedIds.companyStaticId,
      recipientPlatform: 'vakt'
    })

    await waitForExpect(async () => {
      const hasMessage = await amqpUtility.hasMessageOnQueue(iEnv.mockedIds.outboundVaktQueue)
      expect(hasMessage).toBeTruthy()

      const vaktMessage = await amqpUtility.getMessageOnQueue(iEnv.mockedIds.outboundVaktQueue)
      expect(vaktMessage).toBeDefined()

      expect(vaktMessage.properties.messageId).toEqual(mockedMessageId1)
      expect(vaktMessage.properties.correlationId).toEqual(mockedCorrelationId)
      expect(vaktMessage.properties.headers[HEADERS.RecipientMnid]).toEqual(iEnv.mockedIds.recipientMNID)
      expect(vaktMessage.properties.timestamp).toBeLessThanOrEqual(Date.now())
      expect(vaktMessage.properties.headers[HEADERS.SenderMnid]).toEqual(iEnv.mockedIds.senderMNID)
      expect(vaktMessage.properties.contentEncoding).toEqual('utf-8')
      expect(vaktMessage.properties.contentType).toEqual('application/json')
      expect(vaktMessage.properties.headers[HEADERS.EnvelopeVersion]).toEqual('0001')
      expect(HEADERS.SenderPlatform in vaktMessage.properties.headers).toBeFalsy()

      await amqpUtility.purgeQueue(iEnv.mockedIds.outboundVaktQueue)

      await verifyMessageAudited(mockedMessageId1, STATUS.Processing)
      await verifyMessageAudited(mockedMessageId1, STATUS.Processed)
    })
  })

  /**
   * Given:
   * A message is received in Internal MQ with MONITORING as platform
   *
   * When:
   * should consume the message and send to the Common MQ queue of the outbound MONITORING
   *
   * Then:
   * unencrypted message should be in the MONITORING queue
   */
  it('should be unencryped forwarded to Common Broker in MONITORING queue', async () => {
    mockSuccessAPISigner()
    mockPassthroughAnyRequest()

    await publisherMicroservice.publish('komgo.monitoring', mockClearMessage, {
      messageId: mockedMessageId1,
      correlationId: mockedCorrelationId,
      recipientStaticId: iEnv.mockedIds.companyStaticId,
      recipientPlatform: 'monitoring'
    })

    await waitForExpect(async () => {
      const hasMessage = await amqpUtility.hasMessageOnQueue(iEnv.mockedIds.outboundMonitoringQueue)
      expect(hasMessage).toBeTruthy()

      const monitoringMessage = await amqpUtility.getMessageOnQueue(iEnv.mockedIds.outboundMonitoringQueue)
      expect(monitoringMessage).toBeDefined()

      expect(monitoringMessage.properties.messageId).toEqual(mockedMessageId1)
      expect(monitoringMessage.properties.correlationId).toEqual(mockedCorrelationId)
      expect(monitoringMessage.properties.timestamp).toBeLessThanOrEqual(Date.now())
      expect(monitoringMessage.properties.contentEncoding).toEqual('utf-8')
      expect(monitoringMessage.properties.contentType).toEqual('application/json')
      expect(JSON.parse(monitoringMessage.content)).toEqual(mockClearMessage)
      expect(HEADERS.SenderPlatform in monitoringMessage.properties.headers).toBeFalsy()

      await amqpUtility.purgeQueue(iEnv.mockedIds.outboundMonitoringQueue)
    })
  })

  /**
   * Given:
   * A message is received in Internal MQ with EMAIL-NOTIFICATION as platform
   *
   * When:
   * should consume the message and send to the Common MQ queue of the outbound EMAIL-NOTIFICATION
   *
   * Then:
   * unencrypted message should be in the EMAIL-NOTIFICATION queue
   */
  it('should be unencryped forwarded to Common Broker in EMAIL-NOTIFICATION queue', async () => {
    mockSuccessAPISigner()
    mockPassthroughAnyRequest()

    await publisherMicroservice.publish('komgo.email-notification', mockClearMessage, {
      messageId: mockedMessageId1,
      correlationId: mockedCorrelationId,
      recipientStaticId: iEnv.mockedIds.companyStaticId,
      recipientPlatform: 'email-notification'
    })

    await waitForExpect(async () => {
      const hasMessage = await amqpUtility.hasMessageOnQueue(iEnv.mockedIds.outboundEmailNotificationQueue)
      expect(hasMessage).toBeTruthy()

      const monitoringMessage = await amqpUtility.getMessageOnQueue(iEnv.mockedIds.outboundEmailNotificationQueue)
      expect(monitoringMessage).toBeDefined()

      expect(monitoringMessage.properties.messageId).toEqual(mockedMessageId1)
      expect(monitoringMessage.properties.correlationId).toEqual(mockedCorrelationId)
      expect(monitoringMessage.properties.timestamp).toBeLessThanOrEqual(Date.now())
      expect(monitoringMessage.properties.contentEncoding).toEqual('utf-8')
      expect(monitoringMessage.properties.contentType).toEqual('application/json')
      expect(JSON.parse(monitoringMessage.content)).toEqual(mockClearMessage)
      expect(HEADERS.SenderPlatform in monitoringMessage.properties.headers).toBeFalsy()

      await amqpUtility.purgeQueue(iEnv.mockedIds.outboundEmailNotificationQueue)
    })
  })

  /**
   * Given:
   * A message is received in Internal MQ
   *
   * When:
   * there is a system error when encrypting the message
   *
   * Then:
   * message should be kept in the queue and should have been redelivered at least once
   * The message should be audited to the database in Processing and FailedServerError status
   */
  it('should be kept in the queue if there is a system error encrypting the message', async () => {
    mockSuccessAPIRegistryKomgoThenMnid()
    mockFailServerErrorEncryptAlwaysAPISigner()
    mockPassthroughAnyRequest()
    const toEventMgntQueueName = `${iEnv.mockedIds.eventConsumerId}.${iEnv.mockedIds.eventToPublisherId}.queue`

    await publisherMicroservice.publish(mockClearMessage.messageType, mockClearMessage, {
      messageId: mockedMessageId1,
      correlationId: mockedCorrelationId,
      recipientMnid: iEnv.mockedIds.recipientMNID,
      senderMnid: iEnv.mockedIds.senderMNID,
      recipientStaticId: iEnv.mockedIds.companyStaticId
    })

    await sleep(500) // hold to let service process the message
    await service.stop()

    await waitForExpect(async () => {
      const message = await amqpUtility.getMessageOnQueue(toEventMgntQueueName)

      expect(message).toBeDefined()
      expect(message.fields.redelivered).toBeTruthy()

      await verifyMessageAudited(mockedMessageId1, STATUS.FailedServerError)
    })
    amqpUtility.purgeQueue(toEventMgntQueueName) // clear up to delete successfully the queue as empty
  })

  /**
   * Given:
   * A message is received in Internal MQ
   *
   * When:
   * should reject the message if Common-MQ returns 413 (nginx error, HTTP request payload too large)
   *
   * Then:
   * message should be moved in the dead queue in Internal-MQ
   * The message should be audited to the database in Processing and FailedProcessing status
   */
  it('should be rejected if the size is bigger than allowed in Common-MQ', async () => {
    mockSuccessAPIRegistryKomgoThenMnid()
    mockSuccessAPISigner()
    mockFailTooLargeCommonMQ()
    mockPassthroughAnyRequest()

    await publisherMicroservice.publish(mockClearMessage.messageType, mockClearMessage, {
      messageId: mockedMessageId1,
      correlationId: mockedCorrelationId,
      recipientStaticId: iEnv.mockedIds.companyStaticId
    })

    await waitForExpect(async () => {
      const receivedMessage: CommonMessageReceived = await intraMessaging.getMessage(iEnv.mockedIds.companyStaticId)
      expect(receivedMessage).toBeUndefined()

      expect(await amqpUtility.hasMessageOnQueue(iEnv.mockedIds.eventToPublisherDeadQueue)).toBeTruthy()

      const rejectedMessage = await amqpUtility.getMessageOnQueue(iEnv.mockedIds.eventToPublisherDeadQueue)
      expect(rejectedMessage).toBeDefined()

      expect(rejectedMessage.properties.messageId).toEqual(mockedMessageId1)
      expect(rejectedMessage.properties.correlationId).toEqual(mockedCorrelationId)
      expect(rejectedMessage.properties.headers[HEADERS.RecipientStaticId]).toEqual(iEnv.mockedIds.companyStaticId)
      expect(rejectedMessage.properties.contentEncoding).toEqual('utf-8')
      expect(rejectedMessage.properties.contentType).toEqual('application/json')

      await verifyMessageAudited(mockedMessageId1, STATUS.FailedProcessing)

      await amqpUtility.purgeQueue(iEnv.mockedIds.eventToPublisherDeadQueue)
    })
  })

  /**
   * Given:
   * A message is received in Internal MQ
   *
   * When:
   * should reject the message if API-Signer returns 413 (express error)
   *
   * Then:
   * message should be moved in the dead queue in Internal-MQ
   * The message should be audited to the database in Processing and FailedProcessing status
   */
  it('should be rejected if the size is bigger than allowed in API-Signer', async () => {
    mockSuccessAPIRegistryKomgoThenMnid()
    mockFailTooLargeApiSigner()
    mockPassthroughAnyRequest()

    await publisherMicroservice.publish(mockClearMessage.messageType, mockClearMessage, {
      messageId: mockedMessageId1,
      correlationId: mockedCorrelationId,
      recipientStaticId: iEnv.mockedIds.companyStaticId
    })

    await waitForExpect(async () => {
      const receivedMessage: CommonMessageReceived = await intraMessaging.getMessage(iEnv.mockedIds.companyStaticId)
      expect(receivedMessage).toBeUndefined()

      expect(await amqpUtility.hasMessageOnQueue(iEnv.mockedIds.eventToPublisherDeadQueue)).toBeTruthy()

      const rejectedMessage = await amqpUtility.getMessageOnQueue(iEnv.mockedIds.eventToPublisherDeadQueue)
      expect(rejectedMessage).toBeDefined()

      expect(rejectedMessage.properties.messageId).toEqual(mockedMessageId1)
      expect(rejectedMessage.properties.correlationId).toEqual(mockedCorrelationId)
      expect(rejectedMessage.properties.headers[HEADERS.RecipientStaticId]).toEqual(iEnv.mockedIds.companyStaticId)
      expect(rejectedMessage.properties.contentEncoding).toEqual('utf-8')
      expect(rejectedMessage.properties.contentType).toEqual('application/json')

      await verifyMessageAudited(mockedMessageId1, STATUS.FailedProcessing)

      await amqpUtility.purgeQueue(iEnv.mockedIds.eventToPublisherDeadQueue)
    })
  })

  /**
   * Given:
   * A message is received in Internal MQ
   *
   * When:
   * should reject the message if the recipient is not a member of Komgo
   *
   * Then:
   * message should be moved in the dead queue in Internal-MQ
   * The message should be audited to the database in Processing and FailedProcessing status
   */
  it('should be rejected if the recipient is not a member of Komgo', async () => {
    mockSuccessAPIRegistryKomgoThenMnid(false)
    mockSuccessAPISigner()
    mockPassthroughAnyRequest()

    await publisherMicroservice.publish(mockClearMessage.messageType, mockClearMessage, {
      messageId: mockedMessageId1,
      correlationId: mockedCorrelationId,
      recipientStaticId: iEnv.mockedIds.companyStaticId
    })

    await waitForExpect(async () => {
      const receivedMessage: CommonMessageReceived = await intraMessaging.getMessage(iEnv.mockedIds.companyStaticId)
      expect(receivedMessage).toBeUndefined()

      expect(await amqpUtility.hasMessageOnQueue(iEnv.mockedIds.eventToPublisherDeadQueue)).toBeTruthy()

      const rejectedMessage = await amqpUtility.getMessageOnQueue(iEnv.mockedIds.eventToPublisherDeadQueue)
      expect(rejectedMessage).toBeDefined()

      expect(rejectedMessage.properties.messageId).toEqual(mockedMessageId1)

      await verifyMessageAudited(mockedMessageId1, STATUS.FailedProcessing)

      await amqpUtility.purgeQueue(iEnv.mockedIds.eventToPublisherDeadQueue)
    })
  })

  /**
   * Given:
   * A message is received in Internal MQ
   *
   * When:
   * should reject the message if company registry doesn't have information if is a member of komgo
   *
   * Then:
   * message should be moved in the dead queue in Internal-MQ
   * The message should be audited to the database in Processing and FailedProcessing status
   */
  it('should be rejected if there is no information if recipient is member of Komgo', async () => {
    mockSuccessAPIRegistryKomgoThenMnidWithoutIsMember()
    mockSuccessAPISigner()
    mockPassthroughAnyRequest()

    await publisherMicroservice.publish(mockClearMessage.messageType, mockClearMessage, {
      messageId: mockedMessageId1,
      correlationId: mockedCorrelationId,
      recipientStaticId: iEnv.mockedIds.companyStaticId
    })

    await waitForExpect(async () => {
      const receivedMessage: CommonMessageReceived = await intraMessaging.getMessage(iEnv.mockedIds.companyStaticId)
      expect(receivedMessage).toBeUndefined()

      expect(await amqpUtility.hasMessageOnQueue(iEnv.mockedIds.eventToPublisherDeadQueue)).toBeTruthy()

      const rejectedMessage = await amqpUtility.getMessageOnQueue(iEnv.mockedIds.eventToPublisherDeadQueue)
      expect(rejectedMessage).toBeDefined()

      expect(rejectedMessage.properties.messageId).toEqual(mockedMessageId1)

      await verifyMessageAudited(mockedMessageId1, STATUS.FailedProcessing)

      await amqpUtility.purgeQueue(iEnv.mockedIds.eventToPublisherDeadQueue)
    })
  })

  /**
   * Given:
   * A message is received in Internal MQ
   *
   * When:
   * there is a system error when encrypting the message
   *
   * Then:
   * message should be kept in the queue and should be redelivered until it is successful.
   * The procesing and failed status message should be audited to the database only once
   */
  it('should be kept in the queue if there is a system error encrypting the message and audited to database only once', async () => {
    mockSuccessAPIRegistryKomgoThenMnid()
    mockMultipleApiSignerErrorsBeforeSuccess()
    mockPassthroughAnyRequest()

    await publisherMicroservice.publish(mockClearMessage.messageType, mockClearMessage, {
      messageId: mockedMessageId1,
      correlationId: mockedCorrelationId,
      recipientMnid: iEnv.mockedIds.recipientMNID,
      senderMnid: iEnv.mockedIds.senderMNID,
      recipientStaticId: iEnv.mockedIds.companyStaticId
    })

    await waitForExpect(async () => {
      const receivedMessage: CommonMessageReceived = await intraMessaging.getMessage(iEnv.mockedIds.companyStaticId)
      expect(receivedMessage).toBeDefined()
      expect(receivedMessage.properties.messageId).toEqual(mockedMessageId1)

      await intraMessaging.ackMessage()

      await verifyAuditMessagesSavedOnce(mockedMessageId1)
    })
  })

  /**
   * Given:
   * 2 messages are received in Internal MQ with a different RequestId header
   * First HTTP request to API-Signer is delayed for 2 seconds
   *
   * When:
   * The first message is processed, it is holded while waits for the API-Signer response.
   * In the meantime, second message gets processed with a different RequestID
   *
   * Then:
   * The RequestID for every related API-Signer call should match what is included in the AMQP requestId header
   */
  it('should use the requestId included in the AMQP message from Internal-MQ for HTTP Requests to other APIs', async () => {
    const requestId1 = 'test-uuid4-1'
    const requestId2 = 'test-uuid4-2'

    mockSuccessAPIRegistryKomgoThenMnid()
    mockSuccessAPISignerMatchRequestId(requestId1, requestId2)
    mockPassthroughAnyRequest()

    await publisherMicroservice.publish(mockClearMessage.messageType, mockClearMessage, {
      messageId: mockedMessageId1,
      correlationId: mockedCorrelationId,
      recipientMnid: iEnv.mockedIds.recipientMNID,
      senderMnid: iEnv.mockedIds.senderMNID,
      recipientStaticId: iEnv.mockedIds.companyStaticId,
      requestId: requestId1
    })

    await sleep(DELAY_REQUEST_ID_MOCK / 4)

    await publisherMicroservice.publish(mockClearMessage.messageType, mockClearMessage, {
      messageId: mockedMessageId2,
      correlationId: mockedCorrelationId,
      recipientMnid: iEnv.mockedIds.recipientMNID,
      senderMnid: iEnv.mockedIds.senderMNID,
      recipientStaticId: iEnv.mockedIds.companyStaticId,
      requestId: requestId2
    })

    await waitForExpect(async () => {
      await verifyMessageAudited(mockedMessageId2, STATUS.Processed) // wait to be processed before checking in Common-MQ

      const receivedMessage2: CommonMessageReceived = await intraMessaging.getMessage(iEnv.mockedIds.companyStaticId)

      expect(receivedMessage2).toBeDefined()
      expect(receivedMessage2.properties.messageId).toEqual(mockedMessageId2)

      await intraMessaging.ackMessage()
    })
    await waitForExpect(async () => {
      await verifyMessageAudited(mockedMessageId1, STATUS.Processed) // wait to be processed before checking in Common-MQ

      const receivedMessage1: CommonMessageReceived = await intraMessaging.getMessage(iEnv.mockedIds.companyStaticId)

      expect(receivedMessage1).toBeDefined()
      expect(receivedMessage1.properties.messageId).toEqual(mockedMessageId1)

      await intraMessaging.ackMessage()
    })
  })

  afterEach(async () => {
    await service.stop()
    await publisherMicroservice.afterEach()
    await iEnv.afterEach()
    iEnv.axiosMock.reset()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  async function verifyAuditMessagesSavedOnce(messageId) {
    await verifyMessageSavedOnce(messageId, STATUS.Processing)
    await verifyMessageSavedOnce(messageId, STATUS.FailedServerError)
    await verifyMessageSavedOnce(messageId, STATUS.Processed)
  }

  async function verifyMessageSavedOnce(messageId: string, status: STATUS) {
    const message = await (messageDataAgent as any).internalToCommonMessageModel.find({
      'messageProperties.messageId': messageId,
      status
    })
    expect(message.length).toBe(1)
    expect(message[0].messageProperties.messageId).toBe(messageId)
    expect(message[0].status).toBe(status)
  }

  async function verifyMessageAudited(messageId: string, status: STATUS) {
    // Check message audited
    const message = await messageDataAgent.findInternalToCommonlMessage({
      'messageProperties.messageId': messageId,
      status
    })
    expect(message).not.toBe(null)
    expect(message.messageProperties.messageId).toBe(messageId)
    expect(message.status).toBe(status)
  }

  function mockTestApiRegistry() {
    iEnv.axiosMock.onGet(/api-test-registry.*/).replyOnce(200, [
      {
        komgoMnid: iEnv.mockedIds.recipientMNID
      }
    ])
  }

  function mockSuccessAPIRegistryKomgoThenMnid(isMember = true) {
    iEnv.axiosMock
      // for this.companyRegistryAgent.getPropertyFromMnid(mnidType, senderMnid, keyType) inside CommonToInternalForwardingService
      .onGet(/api-registry.*/)
      .replyOnce(200, getMockAPIRegistryKomgoResponse(isMember))
      .onGet(/api-registry.*/)
      .replyOnce(200, getMockApiCompanyMnidResponse())
      .onGet(/api-registry.*/)
      .reply(200, getMockAPIRegistryKomgoResponse(isMember))
  }

  function mockSuccessAPIRegistryKomgoThenMnidWithoutIsMember() {
    iEnv.axiosMock
      // for this.companyRegistryAgent.getPropertyFromMnid(mnidType, senderMnid, keyType) inside CommonToInternalForwardingService
      .onGet(/api-registry.*/)
      .replyOnce(200, getMockAPIRegistryKomgoResponseWithoutIsMember())
      .onGet(/api-registry.*/)
      .replyOnce(200, getMockApiCompanyMnidResponse())
      .onGet(/api-registry.*/)
      .reply(200, getMockAPIRegistryKomgoResponseWithoutIsMember())
  }

  function mockSuccessAPIRegistryVakt() {
    iEnv.axiosMock
      // for this.companyRegistryAgent.getPropertyFromMnid(mnidType, senderMnid, keyType) inside CommonToInternalForwardingService
      .onGet(/api-registry.*/)
      .replyOnce(200, getMockAPIRegistryVaktResponse())
      .onGet(/api-registry.*/)
      .replyOnce(200, getMockApiCompanyMnidResponse())
  }

  function mockSuccessAPISigner() {
    iEnv.axiosMock
      // await this.signerAgent.sign(payload) inside EnvelopeAgent
      .onPost(/rsa-signer\/sign.*/)
      .reply(200, {
        jws: 'jws'
      })
      // await this.signerAgent.encrypt(jws.jws, jwk) inside EnvelopeAgent
      .onPost(/rsa-signer\/encrypt.*/)
      .reply(200, {
        jwe: mockMessageEncryptedContent
      })
  }

  function mockSuccessAPISignerMatchRequestId(matchRequestId1: string, matchRequestId2: string) {
    iEnv.axiosMock
      // await this.signerAgent.sign(payload) inside EnvelopeAgent
      .onPost(/rsa-signer\/sign.*/)
      .replyOnce(config => {
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve(getMockAPISignerSignResponse(config, matchRequestId1))
          }, DELAY_REQUEST_ID_MOCK)
        })
      })
      .onPost(/rsa-signer\/sign.*/)
      .replyOnce(config => getMockAPISignerSignResponse(config, matchRequestId2))
      // await this.signerAgent.encrypt(jws.jws, jwk) inside EnvelopeAgent
      .onPost(/rsa-signer\/encrypt.*/)
      .replyOnce(config => getMockAPISignerEncryptResponse(config, matchRequestId2))
      .onPost(/rsa-signer\/encrypt.*/)
      .replyOnce(config => getMockAPISignerEncryptResponse(config, matchRequestId1))
  }

  /**
   * This is replicating a situation whereby the api-signer is failing for a period of time
   * and then comes back up and responds sucessfully
   */
  function mockMultipleApiSignerErrorsBeforeSuccess() {
    iEnv.axiosMock
      // this.signerAgent.decrypt(encryptedEnvelope) inside EnvelopeAgent
      .onPost(/rsa-signer\/sign.*/)
      .replyOnce(500, undefined)
      .onPost(/rsa-signer\/sign.*/)
      .replyOnce(500, undefined)
      .onPost(/rsa-signer\/sign.*/)
      .replyOnce(500, undefined)
    mockSuccessAPISigner()
  }

  function mockFailServerErrorEncryptAlwaysAPISigner() {
    iEnv.axiosMock
      // await this.signerAgent.sign(payload) inside EnvelopeAgent
      .onPost(/rsa-signer\/sign.*/)
      .reply(200, {
        jws: 'jws'
      })
      // await this.signerAgent.encrypt(jws.jws, jwk) inside EnvelopeAgent
      .onPost(/rsa-signer\/encrypt.*/)
      .reply(500, undefined)
  }

  function mockFailTooLargeCommonMQ() {
    iEnv.axiosMock
      // sendMessage() inside CommonMessagingAgent
      .onPost(/exchanges.*/)
      .reply(413, {})
  }

  function mockFailTooLargeApiSigner() {
    iEnv.axiosMock
      // await this.signerAgent.sign(payload) inside EnvelopeAgent
      .onPost(/rsa-signer\/sign.*/)
      .reply(413, {})
  }

  function mockPassthroughAnyRequest() {
    iEnv.axiosMock.onAny().passThrough()
  }

  function getMockAPIRegistryKomgoResponseWithoutIsMember() {
    return [
      {
        komgoMnid: iEnv.mockedIds.recipientMNID,
        komgoMessagingPubKeys: [
          {
            current: true,
            key: JSON.stringify({
              kty: 'a',
              kid: 'a',
              e: 'a',
              n: 'a'
            })
          }
        ]
      }
    ]
  }

  function getMockAPIRegistryKomgoResponse(isMember = true) {
    return [
      {
        komgoMnid: iEnv.mockedIds.recipientMNID,
        isMember,
        komgoMessagingPubKeys: [
          {
            current: true,
            key: JSON.stringify({
              kty: 'a',
              kid: 'a',
              e: 'a',
              n: 'a'
            })
          }
        ]
      }
    ]
  }

  function getMockApiCompanyMnidResponse() {
    return [
      {
        komgoMnid: iEnv.mockedIds.senderMNID
      }
    ]
  }
  function getMockAPIRegistryVaktResponse() {
    return [
      {
        vaktMnid: iEnv.mockedIds.recipientMNID,
        vaktMessagingPubKeys: [
          {
            current: true,
            key: JSON.stringify({
              kty: 'a',
              kid: 'a',
              e: 'a',
              n: 'a'
            })
          }
        ]
      }
    ]
  }

  function getMockAPISignerSignResponse(config: any, matchRequestId: string) {
    if (config.headers[REQUEST_ID_HEADER] === matchRequestId) {
      return [
        200,
        {
          jws: 'jws'
        }
      ]
    } else {
      return [500, {}]
    }
  }

  function getMockAPISignerEncryptResponse(config: any, matchRequestId: string) {
    if (config.headers[REQUEST_ID_HEADER] === matchRequestId) {
      return [
        200,
        {
          jwe: mockMessageEncryptedContent
        }
      ]
    } else {
      return [500, {}]
    }
  }

  async function wait() {
    await waitForExpect(async () => {
      const receivedMessage: CommonMessageReceived = await intraMessaging.getMessage(iEnv.mockedIds.companyStaticId)
      expect(receivedMessage).toBeUndefined()

      expect(await amqpUtility.hasMessageOnQueue(iEnv.mockedIds.eventToPublisherDeadQueue)).toBeTruthy()

      const rejectedMessage = await amqpUtility.getMessageOnQueue(iEnv.mockedIds.eventToPublisherDeadQueue)
      expect(rejectedMessage).toBeDefined()

      expect(rejectedMessage.properties.messageId).toEqual(mockedMessageId1)

      await verifyMessageAudited(mockedMessageId1, STATUS.FailedProcessing)

      await amqpUtility.purgeQueue(iEnv.mockedIds.eventToPublisherDeadQueue)
    })
  }
})
