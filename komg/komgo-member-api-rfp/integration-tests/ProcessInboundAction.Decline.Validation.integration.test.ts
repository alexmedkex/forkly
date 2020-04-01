import { PublisherMicroservice, AMQPUtility, ConsumerMicroservice } from '@komgo/integration-test-utilities'
import { ActionType, IRequestForProposal } from '@komgo/types'
import { Container } from 'inversify'

import { VALUES } from '../src/inversify/values'

import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { ProcessActionAssertUtils } from './utils/ProcessActionAssertUtils'
import {
  createInternalConsumerQueue,
  createRFPInDb,
  createProcessedActionInDb,
  createReplyMessage
} from './utils/utils'

jest.setTimeout(90000)

const INTERNAL_ROUTING_KEY_BIND = 'INTERNAL.RFP.tradeFinance.rd.#'
const CONSUMER_NAME = 'test-consumer'
const MOCK_RESPONSE_DATA = { data: 'mockResponseData' }
const TRADER_ID = 'traderId'

describe('Validation when processing inbound Decline action', () => {
  let iEnv: IntegrationEnvironment
  let publisherMicroservice: PublisherMicroservice
  let consumerMicroservice: ConsumerMicroservice
  let amqpUtility: AMQPUtility
  let deadQueueName: string
  let iocContainer: Container

  let assertUtils: ProcessActionAssertUtils

  let companyStaticId: string

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

    // start real http servers mocking and api-registry
    iEnv.startApiRegistryMockServer()

    assertUtils = new ProcessActionAssertUtils(ActionType.Decline, consumerMicroservice, amqpUtility, deadQueueName)
    companyStaticId = iocContainer.get<string>(VALUES.CompanyStaticId)
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

  describe('Validation failures', () => {
    it(`should reject AMQP message if a Reject has been sent before receiving the Decline`, async () => {
      const rfp = await mockRequestReceived()
      await mockRejectSent(rfp, companyStaticId)

      const mesasgeId = await receiveDeclineMessage(publisherMicroservice, rfp.staticId, companyStaticId)

      await assertUtils.assertRejectedMessage(mesasgeId)
    })

    it(`should reject AMQP message if a Decline has already been received`, async () => {
      const rfp = await mockRequestReceived()
      await mockResponseSent(rfp, companyStaticId)
      await mockDeclineReceived(rfp, companyStaticId)

      const mesasgeId = await receiveDeclineMessage(publisherMicroservice, rfp.staticId, companyStaticId)

      await assertUtils.assertRejectedMessage(mesasgeId)
    })

    it(`should reject AMQP message if an Accept has already been received`, async () => {
      const rfp = await mockRequestReceived()
      await mockResponseSent(rfp, companyStaticId)
      await mockAcceptReceived(rfp, companyStaticId)

      const mesasgeId = await receiveDeclineMessage(publisherMicroservice, rfp.staticId, companyStaticId)

      await assertUtils.assertRejectedMessage(mesasgeId)
    })
  })
})

async function receiveDeclineMessage(
  publisherMicroservice: PublisherMicroservice,
  rfpId: string,
  memberStaticId: string
) {
  const mockMessageId = 'fixedMessageId'
  const rfpMessageDecline = createReplyMessage(rfpId, ActionType.Decline, memberStaticId, TRADER_ID, MOCK_RESPONSE_DATA)
  await publisherMicroservice.publish(rfpMessageDecline.messageType, rfpMessageDecline, {
    messageId: mockMessageId
  })

  return mockMessageId
}

async function mockRequestReceived() {
  return createRFPInDb()
}

async function mockRejectSent(rfp: IRequestForProposal, memberStaticId: string) {
  await createProcessedActionInDb(rfp.staticId, ActionType.Reject, memberStaticId, TRADER_ID)
}

async function mockResponseSent(rfp: IRequestForProposal, memberStaticId: string) {
  await createProcessedActionInDb(rfp.staticId, ActionType.Response, memberStaticId, TRADER_ID)
}

async function mockDeclineReceived(rfp: IRequestForProposal, memberStaticId: string) {
  await createProcessedActionInDb(rfp.staticId, ActionType.Decline, TRADER_ID, memberStaticId)
}

async function mockAcceptReceived(rfp: IRequestForProposal, memberStaticId: string) {
  await createProcessedActionInDb(rfp.staticId, ActionType.Accept, TRADER_ID, memberStaticId)
}
