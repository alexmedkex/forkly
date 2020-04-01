import { ConsumerMicroservice } from '@komgo/integration-test-utilities'
import { IMessageReceived } from '@komgo/messaging-library'
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
import { v4 as uuid4 } from 'uuid'
import * as waitForExpect from 'wait-for-expect'

import { IRFPActionMessage, IResponsePayload } from '../src/business-layer/messaging/types'
import { buildMessageType } from '../src/business-layer/messaging/utils'
import { Action } from '../src/data-layer/models/mongo/Action'
import { RequestForProposal } from '../src/data-layer/models/mongo/RequestForProposal'
import { VALUES } from '../src/inversify/values'

import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { createOutboundEventManagementExchange, assertActionsProcessedInDb, FAKE_ACTION_DATA } from './utils/utils'

jest.setTimeout(90000)
/**
 * This integration test uses a MongoDB real container.
 */
describe('Auto-decline action', () => {
  let iEnv: IntegrationEnvironment
  let consumerMS: ConsumerMicroservice
  let iocContainer: Container
  let traderId: string
  const mockBankIds: string[] = []

  const axiosInstance = Axios.create({
    baseURL: 'http://localhost:8080/v0/'
  })

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()
    await iEnv.beforeAll()
    // get the iocContainer from IEnv. IEnv manages when it gets executed and sets up the configuration
    iocContainer = iEnv.getIocContainer()
  })

  beforeEach(async () => {
    consumerMS = new ConsumerMicroservice(iocContainer.get(VALUES.OutboundPublisherId))
    await consumerMS.beforeEach()
    traderId = IntegrationEnvironment.COMPANY_STATIC_ID
    for (let index = 0; index < 5; index++) {
      mockBankIds[index] = `${uuid4()}-bank${index}`
    }
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  afterEach(async () => {
    await consumerMS.afterEach()
  })

  describe('success', () => {
    /**
     * Given:
     * 5 Requests are sent to 5 banks
     *
     * When:
     * bank 1 provides a response
     * bank 2 rejects request
     * bank 3 provides a response
     * bank 4 doesn't provide response
     * bank 5 provides a response
     *
     * trader already declined bank 3
     * trader accepts bank 1
     *
     * Then:
     * bank 1 receives RFP.Accept message
     * bank 4 and 5 receive RFP.Decline message
     * bank 2 and 3 doesnt receive anything
     *
     */
    it('should accept 1 bank and auto-decline 3 others: 2 provided a response and other didnt. 1 bank ignored as it rejected the request', async () => {
      await createOutboundEventManagementExchange(consumerMS, iocContainer)
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp, mockBankIds[0], traderId)
      await mockRequestSentToBanks(rfp, mockBankIds[1], traderId)
      await mockRequestSentToBanks(rfp, mockBankIds[2], traderId)
      await mockRequestSentToBanks(rfp, mockBankIds[3], traderId)
      await mockRequestSentToBanks(rfp, mockBankIds[4], traderId)
      await mockResponseReceivedFromBank(rfp.staticId, mockBankIds[0], traderId)
      await mockRejectReceivedFromBank(rfp.staticId, mockBankIds[1], traderId)
      await mockResponseReceivedFromBank(rfp.staticId, mockBankIds[2], traderId)
      await mockDeclineSentToBank(rfp.staticId, mockBankIds[2], traderId)
      await mockResponseReceivedFromBank(rfp.staticId, mockBankIds[4], traderId)
      const mockAcceptBank1Request: ICreateRFPResponse = {
        responseData: FAKE_ACTION_DATA,
        participantStaticId: mockBankIds[0]
      }

      await postAcceptAPI(rfp.staticId, mockAcceptBank1Request)

      await assertActionsSentToBanks(rfp.staticId, [mockBankIds[0]], ActionType.Accept, FAKE_ACTION_DATA)
      await assertActionsSentToBanks(rfp.staticId, [mockBankIds[2], mockBankIds[3], mockBankIds[4]], ActionType.Decline)
      await assertActionReceivedFromBank(rfp.staticId, mockBankIds[1], traderId, ActionType.Reject)

      await assertMessageAcceptReceivedByBank(rfp.staticId, mockBankIds[0], traderId)
      await assertMessageAutoDeclineReceivedByBank(rfp.staticId, mockBankIds[3], traderId)
      await assertMessageAutoDeclineReceivedByBank(rfp.staticId, mockBankIds[4], traderId)
    })

    it('should accept 1 bank and not auto-decline any bank if all others rejected', async () => {
      await createOutboundEventManagementExchange(consumerMS, iocContainer)
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp, mockBankIds[0], traderId)
      await mockRequestSentToBanks(rfp, mockBankIds[1], traderId)
      await mockRequestSentToBanks(rfp, mockBankIds[2], traderId)
      await mockRejectReceivedFromBank(rfp.staticId, mockBankIds[0], traderId)
      await mockRejectReceivedFromBank(rfp.staticId, mockBankIds[1], traderId)
      await mockResponseReceivedFromBank(rfp.staticId, mockBankIds[2], traderId)
      const mockAcceptBank3Request: ICreateRFPResponse = {
        responseData: FAKE_ACTION_DATA,
        participantStaticId: mockBankIds[2]
      }

      await postAcceptAPI(rfp.staticId, mockAcceptBank3Request)

      await assertActionsSentToBanks(rfp.staticId, [mockBankIds[2]], ActionType.Accept, FAKE_ACTION_DATA)
      await assertActionReceivedFromBank(rfp.staticId, mockBankIds[0], traderId, ActionType.Reject)
      await assertActionReceivedFromBank(rfp.staticId, mockBankIds[1], traderId, ActionType.Reject)

      await assertMessageAcceptReceivedByBank(rfp.staticId, mockBankIds[2], traderId)
    })

    it('should accept 1 bank and auto-decline all other banks that did not provide a quote', async () => {
      await createOutboundEventManagementExchange(consumerMS, iocContainer)
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp, mockBankIds[0], traderId)
      await mockRequestSentToBanks(rfp, mockBankIds[1], traderId)
      await mockRequestSentToBanks(rfp, mockBankIds[2], traderId)
      await mockResponseReceivedFromBank(rfp.staticId, mockBankIds[2], traderId)
      const mockAcceptBank3Request: ICreateRFPResponse = {
        responseData: FAKE_ACTION_DATA,
        participantStaticId: mockBankIds[2]
      }

      await postAcceptAPI(rfp.staticId, mockAcceptBank3Request)

      await assertActionsSentToBanks(rfp.staticId, [mockBankIds[2]], ActionType.Accept, FAKE_ACTION_DATA)
      await assertActionsSentToBanks(rfp.staticId, [mockBankIds[0], mockBankIds[1]], ActionType.Decline)

      await assertMessageAcceptReceivedByBank(rfp.staticId, mockBankIds[2], traderId)
      await assertMessageAutoDeclineReceivedByBank(rfp.staticId, mockBankIds[0], traderId)
      await assertMessageAutoDeclineReceivedByBank(rfp.staticId, mockBankIds[1], traderId)
    })

    it('should accept 1 bank and auto-decline all other banks that provided a quote', async () => {
      await createOutboundEventManagementExchange(consumerMS, iocContainer)
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp, mockBankIds[0], traderId)
      await mockRequestSentToBanks(rfp, mockBankIds[1], traderId)
      await mockRequestSentToBanks(rfp, mockBankIds[2], traderId)
      await mockResponseReceivedFromBank(rfp.staticId, mockBankIds[0], traderId)
      await mockResponseReceivedFromBank(rfp.staticId, mockBankIds[1], traderId)
      await mockResponseReceivedFromBank(rfp.staticId, mockBankIds[2], traderId)
      const mockAcceptBank3Request: ICreateRFPResponse = {
        responseData: FAKE_ACTION_DATA,
        participantStaticId: mockBankIds[2]
      }

      await postAcceptAPI(rfp.staticId, mockAcceptBank3Request)

      await assertActionsSentToBanks(rfp.staticId, [mockBankIds[2]], ActionType.Accept, FAKE_ACTION_DATA)
      await assertActionsSentToBanks(rfp.staticId, [mockBankIds[0], mockBankIds[1]], ActionType.Decline)

      await assertMessageAcceptReceivedByBank(rfp.staticId, mockBankIds[2], traderId)
      await assertMessageAutoDeclineReceivedByBank(rfp.staticId, mockBankIds[0], traderId)
      await assertMessageAutoDeclineReceivedByBank(rfp.staticId, mockBankIds[1], traderId)
    })

    it('should accept 1 bank if only 1 bank was requested, no auto-decline done', async () => {
      await createOutboundEventManagementExchange(consumerMS, iocContainer)
      const rfp = await createRFPInDb()
      await mockRequestSentToBanks(rfp, mockBankIds[0], traderId)
      await mockResponseReceivedFromBank(rfp.staticId, mockBankIds[0], traderId)
      const mockAcceptBank1Request: ICreateRFPResponse = {
        responseData: FAKE_ACTION_DATA,
        participantStaticId: mockBankIds[0]
      }

      await postAcceptAPI(rfp.staticId, mockAcceptBank1Request)

      await assertActionsSentToBanks(rfp.staticId, [mockBankIds[0]], ActionType.Accept, FAKE_ACTION_DATA)

      await assertMessageAcceptReceivedByBank(rfp.staticId, mockBankIds[0], traderId)
    })
  })

  async function postAcceptAPI(rfpId: string, data?: any) {
    return axiosInstance.post(`/accept/${rfpId}`, data)
  }

  async function createRFPInDb() {
    const rfp = buildFakeRequestForProposalExtended(true)
    RequestForProposal.create(rfp)
    return rfp
  }

  async function assertActionReceivedFromBank(rfpId: string, bankID: string, traderID: string, actionType: ActionType) {
    // check it exists in the DB
    const actions: IAction[] = await Action.find({
      rfpId,
      type: actionType,
      recipientStaticID: traderID,
      senderStaticID: bankID
    })
    expect(actions).toBeDefined()
    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe(actionType)
    expect(actions[0].status).toBe(ActionStatus.Processed)
  }

  async function createReplyActionInDb(rfpId: string, actionType: ActionType, sender: string, recipient: string) {
    const responseAction: IAction = buildFakeActionExtended(actionType, true)
    responseAction.senderStaticID = sender
    responseAction.recipientStaticID = recipient
    responseAction.rfpId = rfpId
    responseAction.status = ActionStatus.Processed
    responseAction.status = ActionStatus.Processed
    await Action.create(responseAction)
    return responseAction
  }

  async function mockDeclineSentToBank(rfpId: string, bankID: string, traderID: string) {
    await createReplyActionInDb(rfpId, ActionType.Decline, traderID, bankID)
  }

  async function mockResponseReceivedFromBank(rfpId: string, bankID: string, traderID: string) {
    await createReplyActionInDb(rfpId, ActionType.Response, bankID, traderID)
  }

  async function assertActionsSentToBanks(rfpId: string, bankIDs: string[], actionType: ActionType, data?: any) {
    await assertActionsProcessedInDb(rfpId, bankIDs, actionType, data)
  }

  async function mockRequestSentToBanks(rfp: IRequestForProposal, recipientStaticID: string, senderStaticID: string) {
    const requestAction = buildFakeActionExtended(ActionType.Request, true)
    requestAction.rfpId = rfp.staticId
    requestAction.status = ActionStatus.Processed
    requestAction.senderStaticID = senderStaticID
    requestAction.recipientStaticID = recipientStaticID
    await Action.create(requestAction)
    return requestAction
  }

  async function mockRejectReceivedFromBank(rfpId: string, bankID: string, traderID: string) {
    await createReplyActionInDb(rfpId, ActionType.Reject, bankID, traderID)
  }

  async function assertMessageAcceptReceivedByBank(rfpId: string, recipientStaticID: string, senderStaticID: string) {
    // @ts-ignore
    await waitForExpect(async () => {
      const received: IMessageReceived = await consumerMS.messagingConsumer.get(
        iocContainer.get(VALUES.OutboundPublisherId),
        [buildMessageType(ActionType.Accept)]
      )
      const message = received.content as IRFPActionMessage<IResponsePayload>
      expect(message.data.rfp.rfpId).toEqual(rfpId)
      expect(message.data.response).toEqual(FAKE_ACTION_DATA)
      expect(message.data.rfp.recipientStaticID).toEqual(recipientStaticID)
      expect(message.data.rfp.senderStaticID).toEqual(senderStaticID)

      received.ack()
    })
  }

  async function assertMessageAutoDeclineReceivedByBank(
    rfpId: string,
    recipientStaticID: string,
    senderStaticID: string
  ) {
    // @ts-ignore
    await waitForExpect(async () => {
      const received: IMessageReceived = await consumerMS.messagingConsumer.get(
        iocContainer.get(VALUES.OutboundPublisherId),
        [buildMessageType(ActionType.Decline)]
      )
      const message = received.content as IRFPActionMessage<IResponsePayload>
      expect(message.data.rfp.rfpId).toEqual(rfpId)
      expect(message.data.response).toBeUndefined()
      expect(message.data.rfp.recipientStaticID).toEqual(recipientStaticID)
      expect(message.data.rfp.senderStaticID).toEqual(senderStaticID)

      received.ack()
    })
  }
})
