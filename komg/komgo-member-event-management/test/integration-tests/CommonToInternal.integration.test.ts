import { MessagingFactory, IRequestIdHandler } from '@komgo/messaging-library'
import { AMQPUtility, ConsumerMicroservice } from '@komgo/integration-test-utilities'
import 'reflect-metadata'
import * as waitForExpect from 'wait-for-expect'
import * as validator from 'validator'

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
  mockSuccessAPIRegistry,
  mockPassthroughAnyRequest,
  mockSuccessAPISigner,
  mockMultipleApiSignerErrorsBeforeSuccess,
  mockFailThrownDecryptOnceAPISigner,
  mockFailBadRequestDecryptOnceAPISigner,
  mockFailBadRequestVerifyOnceAPISigner,
  mockFailServerErrorDecryptAlwaysAPISigner
} from './utils/CommonToInternal.mockutils'
import { generateRandomString, sleep } from './utils/utils'
const mockMessageEncryptedContent: IEncryptedEnvelope = {
  message: 'encrypted,sealed,message'
}

const mockClearMessage = {
  messageType: 'routingKey',
  content: 'content inside'
}

// to allow time for RabbitMQ to start
jest.setTimeout(90000)

/**
 * This integration test is using 1 real RabbitMQ for both Common and Internal Brokers (naming is different to avoid conflicts)
 * API Registry and API Signer are mocked.
 */
describe('Common to Internal MQ inbound messages', () => {
  let iEnv: IntegrationEnvironment
  let service: IService
  let intraMessaging: CommonMessagingAgent
  let dummyMicroservice: ConsumerMicroservice
  let amqpUtility: AMQPUtility

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
    dummyMicroservice = new ConsumerMicroservice(iEnv.mockedIds.eventFromPublisherId)
    await dummyMicroservice.beforeEach()

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

  /**
   * Given:
   * A message is received
   *
   * When:
   * consuming and decrypting the message from common broker
   *
   * Then:
   * the message is consumed by the microservice.
   * The message should be audited to the database in Decrypted and Processed status
   */
  it('should be decrypted, verified and forwarded to Internal Broker', async done => {
    // Set api-registry and api-signer REST APIs with mocked responses
    mockSuccessAPIRegistry(iEnv)
    mockSuccessAPISigner(iEnv, mockClearMessage)
    mockPassthroughAnyRequest(iEnv)

    // Send encrypted message to Intra-MQ which will be decrypted and posted in internal mq by the service
    await sendMessageToCommonBroker(mockedMessageId1)

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

  /**
   * Given:
   * there are 2 messages received
   *
   * When:
   * decrypting he message on API signer fails with thrown=true (200 OK status)
   *
   * Then:
   * The first message should be consumed and ignored, second message should be consumed by the microservice.
   * The first message should be audited to the database in FailedProcessing status
   * The second should be audited to the database in Decrypted and Processed status
   */
  it('should be removed from the queue if it fails to decrypt', async done => {
    // Set api-registry and api-signer REST APIs with mocked responses
    mockSuccessAPIRegistry(iEnv)
    mockFailThrownDecryptOnceAPISigner(iEnv)
    mockSuccessAPISigner(iEnv, mockClearMessage)
    mockPassthroughAnyRequest(iEnv)

    // Send encrypted message to Intra-MQ which will be decrypted and posted in internal mq by the service
    await sendMessageToCommonBroker(mockedMessageId1) // should fail
    await sendMessageToCommonBroker(mockedMessageId2) // should succeed

    // callback to verify the messages were audited once the Dummy microservice finishes its verifications
    const verifyMessagesAuditedCallback = async () => {
      await verifyMessageAudited(mockedMessageId1, STATUS.FailedProcessing)
      await verifyMessageAudited(mockedMessageId2, STATUS.Decrypted)
      await verifyMessageAudited(mockedMessageId2, STATUS.Processed)
      // end test
      done()
    }
    verifyMessagesAuditedCallback.fail = done.fail

    // Consume the message decrypted by event-mgnt service from the Internal MQ
    await verifyReceivedMessageInDummyMicroservice(verifyMessagesAuditedCallback, mockedMessageId2)
  })

  /**
   * Given:
   * Receiving multiple messages in the Common Broker
   *
   * When:
   * decrypt & validate them and send them to Internal Broker
   *
   * Then:
   * Messages should be received in order by the microservice and audited to the database
   * All messages should be audited to the database in Decrypted and Processed status
   */
  it('should be decrypted, verified and forwarded to Internal Broker for multiple messages', async done => {
    // Set api-registry and api-signer REST APIs with mocked responses
    mockSuccessAPIRegistry(iEnv)
    mockSuccessAPISigner(iEnv, mockClearMessage)
    mockPassthroughAnyRequest(iEnv)

    const numberOfMessages = 10

    const messageIds: string[] = []
    const correlationIds: string[] = []
    const recipientMnid = iEnv.mockedIds.recipientMNID
    const senderMnid = iEnv.mockedIds.senderMNID
    const recipientStaticId = iEnv.mockedIds.companyStaticId

    const auditMessageVerifiers = []
    for (let i = 0; i < numberOfMessages; i++) {
      const messageId = generateRandomString(7, 'messageId-')
      const correlationId = generateRandomString(7, 'correlationId-')

      messageIds.push(messageId)
      correlationIds.push(correlationId)

      // verifier to check that the message was audited in the Decrypted state and again after it has been Processed
      const verifyMessagesAudited = async () => {
        await verifyMessageAudited(messageId, STATUS.Decrypted)
        await verifyMessageAudited(messageId, STATUS.Processed)
      }
      auditMessageVerifiers.push(verifyMessagesAudited)

      // Send encrypted message to Intra-MQ which will be decrypted and posted in internal mq by the service
      await intraMessaging.sendMessage('komgo.internal', recipientMnid + '-EXCHANGE', mockMessageEncryptedContent, {
        messageId,
        correlationId,
        recipientMnid,
        senderMnid,
        recipientStaticId
      })
    }

    let receivedCounter = 0

    // Consume the message decrypted by event-mgnt service from the Internal MQ
    await dummyMicroservice.messagingConsumer.listen(
      iEnv.mockedIds.eventFromPublisherId,
      mockClearMessage.messageType,
      async received => {
        // message received, verify that the values where copied fine, based on the mocked values
        expect(received.routingKey).toEqual(mockClearMessage.messageType)
        expect(received.content).toEqual(mockClearMessage)
        expect(received.options.messageId).toEqual(messageIds[receivedCounter])
        expect(received.options.correlationId).toEqual(correlationIds[receivedCounter])
        expect(received.options.requestId).toBeDefined()

        // set message as processed to be removed from the queues
        received.ack()

        // finish test only if we have read an amount of messages equal to the number of messages in the queue
        receivedCounter++
        if (receivedCounter === numberOfMessages) {
          // Verfiy all messages were saved to the DB audit record
          for (const verifier of auditMessageVerifiers) {
            await verifier()
          }
          done()
        }
      }
    )
  })

  /**
   * Given:
   * there are 2 messages received
   *
   * When:
   * decrypting the message on API signer fails with 400 bad request
   *
   * Then:
   * The first message should be consumed and ignored, second message should be consumed by the microservice.
   * The first message should be audited to the database in FailedProcessing status
   * The second should be audited to the database in Decrypted and Processed status
   */
  it('should be removed from the queue if it fails to decrypt from API-Signer Bad Request (400) response', async done => {
    // Set api-registry and api-signer REST APIs with mocked responses
    mockSuccessAPIRegistry(iEnv)
    mockFailBadRequestDecryptOnceAPISigner(iEnv)
    mockSuccessAPISigner(iEnv, mockClearMessage)
    mockPassthroughAnyRequest(iEnv)

    // Send encrypted message to Intra-MQ which will be decrypted and posted in internal mq by the service
    await sendMessageToCommonBroker(mockedMessageId1) // should fail
    await sendMessageToCommonBroker(mockedMessageId2) // should succeed

    // callback to verify the messages were audited once the Dummy microservice finishes its verifications
    const verifyMessagesAuditedCallback = async () => {
      await verifyMessageAudited(mockedMessageId1, STATUS.FailedProcessing)
      await verifyMessageAudited(mockedMessageId2, STATUS.Decrypted)
      await verifyMessageAudited(mockedMessageId2, STATUS.Processed)
      // end test
      done()
    }
    verifyMessagesAuditedCallback.fail = done.fail

    // Consume the message decrypted by event-mgnt service from the Internal MQ
    await verifyReceivedMessageInDummyMicroservice(verifyMessagesAuditedCallback, mockedMessageId2)
  })

  /**
   * Given:
   * there are 2 messages received
   *
   * When:
   * verifying he message on API signer fails with 400 bad request
   *
   * Then:
   * The first message should be consumed and ignored, second message should be consumed by the microservice
   */
  it('should be removed from the queue if it fails to verify from API-Signer Bad Request (400) response', async done => {
    // Set api-registry and api-signer REST APIs with mocked responses
    mockSuccessAPIRegistry(iEnv)
    mockFailBadRequestVerifyOnceAPISigner(iEnv)
    mockSuccessAPISigner(iEnv, mockClearMessage)
    mockPassthroughAnyRequest(iEnv)

    // Send encrypted message to Intra-MQ which will be decrypted and posted in internal mq by the service
    await sendMessageToCommonBroker(mockedMessageId1) // should fail
    await sendMessageToCommonBroker(mockedMessageId2) // should succeed

    // callback to verify the messages were audited once the Dummy microservice finishes its verifications
    const verifyMessagesAuditedCallback = async () => {
      await verifyMessageAudited(mockedMessageId1, STATUS.FailedProcessing)
      await verifyMessageAudited(mockedMessageId2, STATUS.Decrypted)
      await verifyMessageAudited(mockedMessageId2, STATUS.Processed)
      // end test
      done()
    }
    verifyMessagesAuditedCallback.fail = done.fail

    // Consume the message decrypted by event-mgnt service from the Internal MQ
    await verifyReceivedMessageInDummyMicroservice(verifyMessagesAuditedCallback, mockedMessageId2)
  })

  /**
   * Given:
   * There is a System Error from API-signer
   *
   * When:
   * Trying to decrypt the message
   *
   * Then:
   * A the message should be kept in Common Broker ACK queue and main queue should be empty.
   * The failed message should be audited to the database in FailedServerError status
   */
  it('should be left in the queue if there is a system error in api signer', async () => {
    // Set api-registry and api-signer REST APIs with mocked responses
    mockSuccessAPIRegistry(iEnv)
    mockFailServerErrorDecryptAlwaysAPISigner(iEnv)
    mockPassthroughAnyRequest(iEnv)
    const mainQueueName = `${iEnv.mockedIds.recipientMNID}-QUEUE`
    const ackQueueName = `${iEnv.mockedIds.recipientMNID}-QUEUE-ACK`

    await sendMessageToCommonBroker(mockedMessageId1)
    await sleep(500) // give time to process the message

    // Verify message should be in the Common Broker ACK queue and not in the main one
    await waitForExpect(async () => {
      const hasMessageOnMainQueue = await amqpUtility.hasMessageOnQueue(mainQueueName)
      expect(hasMessageOnMainQueue).toBeFalsy()
      const hasMessageOnAckQueue = await amqpUtility.hasMessageOnQueue(ackQueueName)
      expect(hasMessageOnAckQueue).toBeTruthy()

      await verifyMessageAudited(mockedMessageId1, STATUS.FailedServerError)
    })
    amqpUtility.purgeQueue(ackQueueName) // clear up to delete successfully the queue as empty
  })

  /**
   * Given:
   * There is a System Error from API-signer
   *
   * When:
   * Trying to decrypt the message
   *
   * Then:
   * THe processing of the message should keep retrying until API-signer works
   * The failed message should only be audited once with FailedServerError status in the database
   * despite multiple processing attempts
   * Once the API-signer responds correcly the message shoud be audited with a status of Decrypted and Procesed
   */
  it('should not create duplicate audit records for failed messages that get reprocessed', async done => {
    // Set api-registry and api-signer REST APIs with mocked responses
    mockSuccessAPIRegistry(iEnv)

    // This will make the api signer fail multiple times before responding correctly which
    // results in the same message being processed multiple times.
    mockMultipleApiSignerErrorsBeforeSuccess(iEnv, mockClearMessage)
    mockPassthroughAnyRequest(iEnv)

    await sendMessageToCommonBroker(mockedMessageId1)

    // callback to verify the messages were audited once the Dummy microservice finishes its verifications
    const verifyMessagesAuditedCallback = async () => {
      await verifyAuditMessagesSavedOnce(mockedMessageId1)
      // end test
      done()
    }
    verifyMessagesAuditedCallback.fail = done.fail

    // The test will keep running until the microservice receives the message once the api-signer responds correctly
    verifyReceivedMessageInDummyMicroservice(verifyMessagesAuditedCallback, mockedMessageId1)
  })

  /**
   * Given:
   * 2 messages received in common
   *
   * When:
   * Both are sent to Internal-MQ
   *
   * Then:
   * They should have different requestIds
   */
  it('should have different requestIds when publishing to Internal-MQ', async done => {
    // Set api-registry and api-signer REST APIs with mocked responses
    mockSuccessAPIRegistry(iEnv)
    mockSuccessAPISigner(iEnv, mockClearMessage)
    mockPassthroughAnyRequest(iEnv)

    // Send encrypted message to Intra-MQ which will be decrypted and posted in internal mq by the service
    await sendMessageToCommonBroker(mockedMessageId1)
    await sendMessageToCommonBroker(mockedMessageId2)

    let receivedCounter = 0
    let requestId1
    let requestId2

    // Consume the message decrypted by event-mgnt service from the Internal MQ
    await dummyMicroservice.messagingConsumer.listen(
      iEnv.mockedIds.eventFromPublisherId,
      mockClearMessage.messageType,
      async received => {
        // message received, verify that the values where copied fine, based on the mocked values
        expect(received.routingKey).toEqual(mockClearMessage.messageType)
        expect(received.content).toEqual(mockClearMessage)
        expect(received.options.requestId).toBeDefined()

        // set message as processed to be removed from the queues
        received.ack()

        // finish test only if we have read an amount of messages equal to the number of messages in the queue
        receivedCounter++
        if (receivedCounter === 1) {
          requestId1 = received.options.requestId
        } else if (receivedCounter === 2) {
          requestId2 = received.options.requestId

          // validate requestIds are different
          expect(requestId2).not.toBe(requestId1)

          done()
        }
      }
    )
  })

  afterEach(async () => {
    await service.stop()
    await dummyMicroservice.afterEach()
    await iEnv.afterEach()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  async function sendMessageToCommonBroker(customMessageId: string, commonRoutingKey: string = 'komgo.internal') {
    await intraMessaging.sendMessage(
      // should succeed
      commonRoutingKey,
      iEnv.mockedIds.recipientMNID + '-EXCHANGE',
      mockMessageEncryptedContent,
      {
        messageId: customMessageId,
        correlationId: mockedCorrelationId,
        recipientMnid: iEnv.mockedIds.recipientMNID,
        senderMnid: iEnv.mockedIds.senderMNID,
        recipientStaticId: iEnv.mockedIds.companyStaticId
      }
    )
  }

  async function verifyReceivedMessageInDummyMicroservice(done: jest.DoneCallback, customMessageId: string) {
    await dummyMicroservice.expectMessage(
      mockClearMessage.messageType,
      {
        routingKey: mockClearMessage.messageType,
        content: mockClearMessage,
        options: {
          messageId: customMessageId,
          correlationId: mockedCorrelationId,
          requestId: expect.any(String)
        },
        hasError: false
      },
      done
    )
  }

  async function verifyAuditMessagesSavedOnce(messageId) {
    await verifyMessageSavedOnce(messageId, STATUS.FailedServerError)
    await verifyMessageSavedOnce(messageId, STATUS.Decrypted)
    await verifyMessageSavedOnce(messageId, STATUS.Processed)
  }

  async function verifyMessageSavedOnce(messageId: string, status: STATUS) {
    const message = await (messageDataAgent as any).commonToInternalMessageModel.find({
      'messageProperties.messageId': messageId,
      status
    })
    expect(message.length).toBe(1)
    expect(message[0].messageProperties.messageId).toBe(messageId)
    expect(message[0].status).toBe(status)
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
