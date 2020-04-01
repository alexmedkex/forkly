import { PublisherMicroservice, AMQPUtility, ConsumerMicroservice } from '@komgo/integration-test-utilities'
import { ActionType, ActionStatus } from '@komgo/types'
import { Container } from 'inversify'

import { buildFakeRequestRFPMessage, buildFakeRequestActionPayload } from '../src/business-layer/messaging/faker'
import { IRFPActionMessage, IActionPayload, IRequestPayload } from '../src/business-layer/messaging/types'
import { Action } from '../src/data-layer/models/mongo/Action'
import { VALUES } from '../src/inversify/values'

import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { MOCK_COMPANY_ENTRY } from './utils/mock-data'
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

describe.each([ActionType.Request, ActionType.Response, ActionType.Reject, ActionType.Accept, ActionType.Decline])(
  'Process inbound actions using paramterised tests',
  actionType => {
    let iEnv: IntegrationEnvironment
    let publisherMicroservice: PublisherMicroservice
    let consumerMicroservice: ConsumerMicroservice
    let amqpUtility: AMQPUtility
    let deadQueueName: string
    let iocContainer: Container
    let assertUtils: ProcessActionAssertUtils
    let rfpMessage: IRFPActionMessage<IActionPayload>

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

      assertUtils = new ProcessActionAssertUtils(actionType, consumerMicroservice, amqpUtility, deadQueueName)
      rfpMessage = await setupDbAndCreateRfpMessage()
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
      it(`should create action data from RFP ${actionType} message`, async done => {
        await publisherMicroservice.publish(rfpMessage.messageType, rfpMessage)

        await assertUtils.assertRFPMessageInDatabase(rfpMessage)
        await assertUtils.assertNoRejectedMessage()
        await assertUtils.assertInternalMessage(rfpMessage, done)
      })

      it(`should process ${actionType} message is duplicate and previous action was not processed`, async done => {
        await publisherMicroservice.publish(rfpMessage.messageType, rfpMessage)

        await assertUtils.assertRFPMessageInDatabase(rfpMessage)
        await assertUtils.assertNoRejectedMessage()
        await assertUtils.assertInternalMessage(rfpMessage)

        await Action.updateOne(
          { staticId: rfpMessage.data.rfp.actionId },
          { $set: { status: ActionStatus.Created } }
        ).exec()

        await publisherMicroservice.publish(rfpMessage.messageType, rfpMessage)
        await assertUtils.assertRFPMessageInDatabase(rfpMessage)
        await assertUtils.assertNoRejectedMessage()
        await assertUtils.assertInternalMessage(rfpMessage, done)
      })
    })

    describe('reject', () => {
      it(`should reject ${actionType} message is duplicate and previous action was already processed`, async () => {
        const mockMessageId = 'fixedMessageId'

        await publisherMicroservice.publish(rfpMessage.messageType, rfpMessage, {
          messageId: mockMessageId
        })
        await assertUtils.assertRFPMessageInDatabase(rfpMessage)
        await assertUtils.assertInternalMessage(rfpMessage)

        // should be rejected
        await publisherMicroservice.publish(rfpMessage.messageType, rfpMessage, {
          messageId: mockMessageId
        })
        await assertUtils.assertRejectedMessage(mockMessageId)
      })

      it(`should reject ${actionType} message if the sender does not exist`, async () => {
        // return an empty array indicating the sender ID was not found
        iEnv.setApiRegistryGetResponse(200, [])
        const mockMessageId = 'fixedMessageId'
        await publisherMicroservice.publish(rfpMessage.messageType, rfpMessage, {
          messageId: mockMessageId
        })
        await assertUtils.assertRejectedMessage(mockMessageId)
      })

      it(`should reject ${actionType} message if the subProductId is invalid`, async () => {
        const mockMessageId = 'fixedMessageId'
        rfpMessage.context.subProductId = 'invalidSubProduct'

        await publisherMicroservice.publish(rfpMessage.messageType, rfpMessage, {
          messageId: mockMessageId
        })

        await assertUtils.assertRejectedMessage(mockMessageId)
      })
    })

    describe('requeue', () => {
      it(`should requeue ${actionType} message if the database is down, then process the message when the database is up`, async done => {
        await iEnv.pauseMongo()
        await publisherMicroservice.publish(rfpMessage.messageType, rfpMessage)
        await assertUtils.assertNoRejectedMessage()
        await iEnv.unpauseMongo()

        await assertUtils.assertRFPMessageInDatabase(rfpMessage)
        await assertUtils.assertNoRejectedMessage()
        await assertUtils.assertInternalMessage(rfpMessage, done)
      })

      it(`should requeue ${actionType} message if get sender fails, then process message once get sender succeeds`, async done => {
        // Api registry returns a 500 intially
        iEnv.setApiRegistryGetResponse(500)
        await publisherMicroservice.publish(rfpMessage.messageType, rfpMessage)
        await assertUtils.assertNoRejectedMessage()
        // Api registry heals and returns a 200 with the company data
        iEnv.setApiRegistryGetResponse(200, [MOCK_COMPANY_ENTRY])
        await assertUtils.assertRFPMessageInDatabase(rfpMessage)
        await assertUtils.assertNoRejectedMessage()
        await assertUtils.assertInternalMessage(rfpMessage, done)
      })
    })

    async function setupDbAndCreateRfpMessage(): Promise<IRFPActionMessage<IActionPayload>> {
      let rfpMsg: IRFPActionMessage<IActionPayload>
      const companyId = iocContainer.get<string>(VALUES.CompanyStaticId)
      if (isReplyActionType(actionType)) {
        const rfp = await createRFPInDb()
        rfpMsg = createReplyMessage(rfp.staticId, actionType, companyId, 'mockId', MOCK_RESPONSE_DATA)
      } else if (actionType === ActionType.Accept) {
        const rfp = await createRFPInDb()
        await createProcessedActionInDb(rfp.staticId, ActionType.Response, companyId, 'mockId')
        rfpMsg = createReplyMessage(rfp.staticId, actionType, companyId, 'mockId', MOCK_RESPONSE_DATA)
      } else if (actionType === ActionType.Request) {
        rfpMsg = createRFPRequestMessage(companyId)
      }
      return rfpMsg
    }

    function createRFPRequestMessage(recipient): IRFPActionMessage<IRequestPayload> {
      const rfpMsg: IRFPActionMessage<IRequestPayload> = buildFakeRequestRFPMessage(buildFakeRequestActionPayload(true))
      rfpMsg.data.rfp.recipientStaticID = recipient
      return rfpMsg
    }
  }
)

function isReplyActionType(actionType: ActionType) {
  return actionType === ActionType.Response || actionType === ActionType.Reject || actionType === ActionType.Decline
}
