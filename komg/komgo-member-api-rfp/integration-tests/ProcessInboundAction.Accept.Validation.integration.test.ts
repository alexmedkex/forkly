import { PublisherMicroservice, AMQPUtility, ConsumerMicroservice } from '@komgo/integration-test-utilities'
import { ActionType, IRequestForProposal, ActionStatus } from '@komgo/types'
import { Container } from 'inversify'

import { IRFPActionMessage, IResponsePayload } from '../src/business-layer/messaging/types'
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

describe('Validation when processing inbound Accept action', () => {
  let iEnv: IntegrationEnvironment
  let publisherMicroservice: PublisherMicroservice
  let consumerMicroservice: ConsumerMicroservice
  let amqpUtility: AMQPUtility
  let deadQueueName: string
  let iocContainer: Container

  let assertUtils: ProcessActionAssertUtils

  let rfp: IRequestForProposal
  let rfpMessageAccept: IRFPActionMessage<IResponsePayload>
  let memberStaticId: string

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

    assertUtils = new ProcessActionAssertUtils(ActionType.Accept, consumerMicroservice, amqpUtility, deadQueueName)

    rfp = await createRFPInDb()
    memberStaticId = iocContainer.get<string>(VALUES.CompanyStaticId)
    rfpMessageAccept = createReplyMessage(
      rfp.staticId,
      ActionType.Accept,
      memberStaticId,
      TRADER_ID,
      MOCK_RESPONSE_DATA
    )
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
    it(`should reject AMQP message if a Response has not been sent before receiving the Accept`, async () => {
      const mockMessageId = 'fixedMessageId'
      await publisherMicroservice.publish(rfpMessageAccept.messageType, rfpMessageAccept, {
        messageId: mockMessageId
      })
      await assertUtils.assertRejectedMessage(mockMessageId)
    })

    it(`should reject AMQP message if a Reject has been received before receiving the Accept`, async () => {
      await mockResponseSent(rfp, memberStaticId)
      await mockRejectReceived(rfp, memberStaticId)
      const mockMessageId = 'fixedMessageId'

      await publisherMicroservice.publish(rfpMessageAccept.messageType, rfpMessageAccept, {
        messageId: mockMessageId
      })
      await assertUtils.assertRejectedMessage(mockMessageId)
    })

    it(`should reject AMQP message if a Decline has been received`, async () => {
      await mockResponseSent(rfp, memberStaticId)
      await mockDeclineReceived(rfp, memberStaticId)
      const mockMessageId = 'fixedMessageId'

      await publisherMicroservice.publish(rfpMessageAccept.messageType, rfpMessageAccept, {
        messageId: mockMessageId
      })
      await assertUtils.assertRejectedMessage(mockMessageId)
    })
  })
})

async function mockResponseSent(rfp: IRequestForProposal, memberStaticId: string) {
  await createProcessedActionInDb(rfp.staticId, ActionType.Response, memberStaticId, TRADER_ID)
}

async function mockRejectReceived(rfp: IRequestForProposal, memberStaticId: string) {
  await createProcessedActionInDb(rfp.staticId, ActionType.Reject, memberStaticId, TRADER_ID)
}

async function mockDeclineReceived(rfp: IRequestForProposal, memberStaticId: string) {
  await createProcessedActionInDb(rfp.staticId, ActionType.Decline, TRADER_ID, memberStaticId)
}
