import { PublisherMicroservice, AMQPUtility, ConsumerMicroservice, sleep } from '@komgo/integration-test-utilities'
import { ActionType, IRequestForProposal } from '@komgo/types'
import { Container } from 'inversify'

import { IRFPActionMessage, IResponsePayload } from '../src/business-layer/messaging/types'
import { VALUES } from '../src/inversify/values'

import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { ProcessActionAssertUtils } from './utils/ProcessActionAssertUtils'
import { createInternalConsumerQueue, createRFPInDb, createReplyMessage } from './utils/utils'

jest.setTimeout(90000)

const INTERNAL_ROUTING_KEY_BIND = 'INTERNAL.RFP.tradeFinance.rd.#'
const CONSUMER_NAME = 'test-consumer'
const MOCK_RESPONSE_DATA = { data: 'mockResponseData' }

describe('Validation when processing inbound actions', () => {
  let iEnv: IntegrationEnvironment
  let publisherMicroservice: PublisherMicroservice
  let consumerMicroservice: ConsumerMicroservice
  let amqpUtility: AMQPUtility
  let deadQueueName: string
  let iocContainer: Container

  let assertUtilsReject: ProcessActionAssertUtils
  let assertUtilsResponse: ProcessActionAssertUtils

  let mockRfp: IRequestForProposal
  let mockCompanyStaticId: string

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()
    await iEnv.beforeAll()
    // get the iocContainer from IEnv. IEnv manages when it gets executed and sets up the configuration
    iocContainer = iEnv.getIocContainer()
    amqpUtility = new AMQPUtility(iEnv.amqpConfig)

    deadQueueName = `${iocContainer.get<string>(VALUES.InboundPublisherId)}.dead`
  })

  beforeEach(async () => {
    publisherMicroservice = new PublisherMicroservice(iocContainer.get<string>(VALUES.InboundPublisherId))
    consumerMicroservice = new ConsumerMicroservice(
      iocContainer.get<string>(VALUES.InternalPublisherId),
      iEnv.amqpConfig,
      CONSUMER_NAME
    )
    await publisherMicroservice.beforeEach()
    await consumerMicroservice.beforeEach()

    await createInternalConsumerQueue(consumerMicroservice, iocContainer, INTERNAL_ROUTING_KEY_BIND)

    // start real http servers mocking api-registry
    iEnv.startApiRegistryMockServer()

    assertUtilsReject = new ProcessActionAssertUtils(
      ActionType.Reject,
      consumerMicroservice,
      amqpUtility,
      deadQueueName
    )
    assertUtilsResponse = new ProcessActionAssertUtils(
      ActionType.Response,
      consumerMicroservice,
      amqpUtility,
      deadQueueName
    )

    mockCompanyStaticId = iocContainer.get<string>(VALUES.CompanyStaticId)
    mockRfp = await createRFPInDb()
  })

  afterEach(async () => {
    await amqpUtility.purgeQueue(deadQueueName)
    await consumerMicroservice.afterEach()
    await publisherMicroservice.afterEach()
    await iEnv.stopApiRegistryMockServer()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  describe('ack', () => {
    it(`should create action data from RFP.Response from participant even if another participant already rejected `, async () => {
      const rejectRfpMessage: IRFPActionMessage<IResponsePayload> = createReplyMessage(
        mockRfp.staticId,
        ActionType.Reject,
        mockCompanyStaticId,
        'rejectSenderStaticId',
        MOCK_RESPONSE_DATA
      )
      const responseRfpMessage: IRFPActionMessage<IResponsePayload> = createReplyMessage(
        mockRfp.staticId,
        ActionType.Response,
        mockCompanyStaticId,
        'responseSenderStaticId',
        MOCK_RESPONSE_DATA
      )

      await publisherMicroservice.publish(rejectRfpMessage.messageType, rejectRfpMessage)
      await sleep(500) // allow message to be processed
      await publisherMicroservice.publish(responseRfpMessage.messageType, responseRfpMessage)

      await assertUtilsReject.assertNoRejectedMessage()
      await assertUtilsResponse.assertNoRejectedMessage()
      await assertUtilsReject.assertRFPMessageInDatabase(rejectRfpMessage)
      await assertUtilsResponse.assertRFPMessageInDatabase(responseRfpMessage)

      await amqpUtility.purgeQueue(`${CONSUMER_NAME}.${iocContainer.get<string>(VALUES.InternalPublisherId)}.queue`)
    })

    it(`should create action data from RFP.Response from participant even if another participant already responded`, async () => {
      const responseRfpMessage1: IRFPActionMessage<IResponsePayload> = createReplyMessage(
        mockRfp.staticId,
        ActionType.Response,
        mockCompanyStaticId,
        'responseRfpMessage1StaticId',
        MOCK_RESPONSE_DATA
      )

      const responseRfpMessage2: IRFPActionMessage<IResponsePayload> = createReplyMessage(
        mockRfp.staticId,
        ActionType.Response,
        mockCompanyStaticId,
        'responseRfpMessage2StaticId',
        MOCK_RESPONSE_DATA
      )

      await publisherMicroservice.publish(responseRfpMessage1.messageType, responseRfpMessage1)
      await sleep(500) // allow message to be processed
      await publisherMicroservice.publish(responseRfpMessage2.messageType, responseRfpMessage2)

      await assertUtilsResponse.assertNoRejectedMessage()
      await assertUtilsResponse.assertNoRejectedMessage()
      await assertUtilsResponse.assertRFPMessageInDatabase(responseRfpMessage1)
      await assertUtilsResponse.assertRFPMessageInDatabase(responseRfpMessage2)

      await amqpUtility.purgeQueue(`${CONSUMER_NAME}.${iocContainer.get<string>(VALUES.InternalPublisherId)}.queue`)
    })
  })
})
