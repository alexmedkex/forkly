import { ErrorCode } from '@komgo/error-utilities'
import { ConsumerMicroservice } from '@komgo/integration-test-utilities'
import {
  ActionType,
  IRequestForProposal,
  buildFakeRequestForProposalExtended,
  buildFakeActionExtended,
  ActionStatus,
  IAction,
  ICreateRFPResponse
} from '@komgo/types'
import Axios from 'axios'
import { Container } from 'inversify'

import { Action } from '../src/data-layer/models/mongo/Action'
import { RequestForProposal } from '../src/data-layer/models/mongo/RequestForProposal'
import { VALUES } from '../src/inversify/values'

import IntegrationEnvironment from './utils/IntegrationEnvironment'
import {
  createOutboundEventManagementExchange,
  assertActionsProcessedInDb,
  assertMostRecentActionProcessed,
  FAKE_ACTION_DATA,
  assertValidOuboundMessage
} from './utils/utils'

jest.setTimeout(90000)
/**
 * This integration test uses a MongoDB real container.
 */
describe('Accept action', () => {
  let iEnv: IntegrationEnvironment
  let consumerMS: ConsumerMicroservice
  let iocContainer: Container
  let traderId: string
  const BANK_ID: string = 'bankId'

  const axiosInstance = Axios.create({
    baseURL: 'http://localhost:8080/v0/'
  })

  const ACCEPT_REPLY_REQUEST: ICreateRFPResponse = {
    responseData: FAKE_ACTION_DATA,
    participantStaticId: BANK_ID
  }

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()
    await iEnv.beforeAll()
    // get the iocContainer from IEnv. IEnv manages when it gets executed and sets up the configuration
    iocContainer = iEnv.getIocContainer()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  beforeEach(async () => {
    consumerMS = new ConsumerMicroservice(iocContainer.get(VALUES.OutboundPublisherId))
    await consumerMS.beforeEach()
    traderId = IntegrationEnvironment.COMPANY_STATIC_ID
  })

  afterEach(async () => {
    await consumerMS.afterEach()
  })

  describe('success', () => {
    it('should create RFP and publish outbound Accept message', async done => {
      await createOutboundEventManagementExchange(consumerMS, iocContainer)
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp)
      await mockResponseReceivedFromBank(rfp.staticId, BANK_ID, traderId)

      await postAcceptAPI(rfp.staticId, ACCEPT_REPLY_REQUEST)

      await assertActionsProcessedInDb(
        rfp.staticId,
        [ACCEPT_REPLY_REQUEST.participantStaticId],
        ActionType.Accept,
        FAKE_ACTION_DATA
      )
      await assertValidOuboundMessage(consumerMS, iocContainer, rfp, ActionType.Accept, BANK_ID, done)
    })

    it('should create RFP and publish outbound Accept message after declining a different bank', async done => {
      const bankId2 = 'bank2Id'
      await createOutboundEventManagementExchange(consumerMS, iocContainer)
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp)
      await mockResponseReceivedFromBank(rfp.staticId, BANK_ID, traderId)
      await mockResponseReceivedFromBank(rfp.staticId, bankId2, traderId)
      await mockDeclineSentToBank(rfp.staticId, traderId, bankId2)

      await postAcceptAPI(rfp.staticId, ACCEPT_REPLY_REQUEST)

      await assertActionsProcessedInDb(
        rfp.staticId,
        [ACCEPT_REPLY_REQUEST.participantStaticId],
        ActionType.Accept,
        FAKE_ACTION_DATA
      )
      await assertValidOuboundMessage(consumerMS, iocContainer, rfp, ActionType.Accept, BANK_ID, done)
    })

    it('should fail to publish action and then succeed on retry', async done => {
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp)
      await mockResponseReceivedFromBank(rfp.staticId, BANK_ID, traderId)

      await iEnv.stopRabbitMQ()
      await postAcceptFailsWithStatusCode(rfp.staticId, ACCEPT_REPLY_REQUEST, 500)

      await iEnv.startRabbitMQ()
      await createOutboundEventManagementExchange(consumerMS, iocContainer)

      await postAcceptAPI(rfp.staticId, ACCEPT_REPLY_REQUEST)

      await assertMostRecentActionProcessed(rfp, ActionType.Accept)
      await assertValidOuboundMessage(consumerMS, iocContainer, rfp, ActionType.Accept, BANK_ID, done)
    })
  })

  describe('internal queue failure', () => {
    beforeEach(async () => {
      await iEnv.stopRabbitMQ()
    })
    afterEach(async () => {
      await iEnv.startRabbitMQ()
    })

    it('should fail creation if action fails to publish', async () => {
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp)
      await createReplyActionInDb(rfp.staticId, ActionType.Response, BANK_ID, traderId)

      await postAcceptFailsWithStatusCode(rfp.staticId, ACCEPT_REPLY_REQUEST, 500, ErrorCode.ConnectionInternalMQ)
    })
  })

  describe('validation failures', () => {
    it('should fail validation if the RFP cannot be found', async () => {
      await postAcceptFailsWithStatusCode('invalidRfpId', ACCEPT_REPLY_REQUEST, 404)
    })

    it('should fail validation if participant has not responded to RFP ', async () => {
      await createOutboundEventManagementExchange(consumerMS, iocContainer)
      const rfp = await createRFPInDb()
      await createRequestActionInDb(rfp)

      await postAcceptFailsWithStatusCode(rfp.staticId, ACCEPT_REPLY_REQUEST, 409)
    })

    it('should fail validation if RFP has been previously Accepted ', async () => {
      await createOutboundEventManagementExchange(consumerMS, iocContainer)
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp)
      await mockResponseReceivedFromBank(rfp.staticId, BANK_ID, traderId)

      await postAcceptAPI(rfp.staticId, ACCEPT_REPLY_REQUEST)
      await assertValidOuboundMessage(consumerMS, iocContainer, rfp, ActionType.Accept, BANK_ID)

      await postAcceptFailsWithStatusCode(rfp.staticId, ACCEPT_REPLY_REQUEST, 409)
    })

    // TODO: use the decline flow once implemented rather than inserting decline Action directly into DB
    it('should fail validation if RFP Response from bank has been previously declined', async () => {
      await createOutboundEventManagementExchange(consumerMS, iocContainer)
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp)
      await mockResponseReceivedFromBank(rfp.staticId, BANK_ID, traderId)
      await mockDeclineSentToBank(rfp.staticId, traderId, BANK_ID)

      await postAcceptFailsWithStatusCode(rfp.staticId, ACCEPT_REPLY_REQUEST, 409)
    })

    it('should fail validation if RFP request has been previously Rejected', async () => {
      await createOutboundEventManagementExchange(consumerMS, iocContainer)
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp)
      await mockResponseReceivedFromBank(rfp.staticId, BANK_ID, traderId)
      await mockRejectReceivedFromBank(rfp, BANK_ID, traderId)

      await postAcceptFailsWithStatusCode(rfp.staticId, ACCEPT_REPLY_REQUEST, 409)
    })
  })

  async function postAcceptAPI(rfpId: string, data?: any) {
    return axiosInstance.post(`/accept/${rfpId}`, data)
  }

  async function postAcceptFailsWithStatusCode(
    rfpId: string,
    acceptReply: ICreateRFPResponse,
    statusCode: number,
    errorCode?: ErrorCode
  ) {
    try {
      await postAcceptAPI(rfpId, acceptReply)
      fail('should have errored')
    } catch (e) {
      expect(e.response.status).toBe(statusCode)
      if (errorCode) {
        expect(e.response.data.errorCode).toEqual(ErrorCode.ConnectionInternalMQ)
      }
    }
  }

  async function createRFPInDb() {
    const rfp = buildFakeRequestForProposalExtended(true)
    RequestForProposal.create(rfp)
    return rfp
  }

  async function createRequestActionInDb(rfp: IRequestForProposal) {
    const requestAction = buildFakeActionExtended(ActionType.Request, true)
    requestAction.rfpId = rfp.staticId
    requestAction.status = ActionStatus.Processed
    requestAction.senderStaticID = traderId
    requestAction.recipientStaticID = BANK_ID
    await Action.create(requestAction)
    return requestAction
  }

  async function createReplyActionInDb(rfpId: string, actionType: ActionType, sender: string, recipient: string) {
    const responseAction: IAction = buildFakeActionExtended(actionType, true)
    responseAction.senderStaticID = sender
    responseAction.recipientStaticID = recipient
    responseAction.rfpId = rfpId
    responseAction.status = ActionStatus.Processed
    await Action.create(responseAction)
    return responseAction
  }

  async function mockDeclineSentToBank(rfpId: string, traderID: string, bankID: string) {
    await createReplyActionInDb(rfpId, ActionType.Decline, traderID, bankID)
  }

  async function mockResponseReceivedFromBank(rfpId: string, bankID: string, traderID: string) {
    await createReplyActionInDb(rfpId, ActionType.Response, bankID, traderID)
  }

  async function mockRequestSentToBanks(rfp: IRequestForProposal) {
    await createRequestActionInDb(rfp)
  }
  async function mockRejectReceivedFromBank(rfp: IRequestForProposal, bankID: string, traderID: string) {
    await createReplyActionInDb(rfp.staticId, ActionType.Reject, bankID, traderID)
  }
})
