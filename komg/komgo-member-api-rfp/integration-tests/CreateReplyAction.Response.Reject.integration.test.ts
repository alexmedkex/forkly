import { ErrorCode } from '@komgo/error-utilities'
import { ConsumerMicroservice } from '@komgo/integration-test-utilities'
import {
  ActionType,
  IRequestForProposal,
  buildFakeRequestForProposalExtended,
  buildFakeActionExtended,
  ActionStatus,
  IAction
} from '@komgo/types'
import Axios from 'axios'
import { Container } from 'inversify'

import { Action } from '../src/data-layer/models/mongo/Action'
import { RequestForProposal } from '../src/data-layer/models/mongo/RequestForProposal'
import { VALUES } from '../src/inversify/values'
import CreateRFPReplyRequest from '../src/service-layer/requests/CreateRFPReplyRequest'

import IntegrationEnvironment from './utils/IntegrationEnvironment'
import {
  createOutboundEventManagementExchange,
  assertActionsProcessedInDb,
  assertMostRecentActionProcessed,
  assertValidOuboundMessage
} from './utils/utils'

jest.setTimeout(90000)
/**
 * This integration test uses a MongoDB real container.
 */
describe('Response & Reject create action', () => {
  let iEnv: IntegrationEnvironment
  let consumerMS: ConsumerMicroservice
  let iocContainer: Container

  const axiosInstance = Axios.create({
    baseURL: 'http://localhost:8080/v0/'
  })

  const FAKE_ACTION_DATA = { fakeData: 'hello' }

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()
    await iEnv.beforeAll()
    // get the iocContainer from IEnv. IEnv manages when it gets executed and sets up the configuration
    iocContainer = iEnv.getIocContainer()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  /**
   * Common tests valid for both cases
   */
  describe.each([ActionType.Response, ActionType.Reject])('Create', (actionType: ActionType) => {
    describe(`${actionType} Action`, () => {
      beforeEach(async () => {
        consumerMS = new ConsumerMicroservice(iocContainer.get(VALUES.OutboundPublisherId))
        await consumerMS.beforeEach()
      })

      afterEach(async () => {
        await consumerMS.afterEach()
      })

      describe('success', () => {
        it('should create rfp data with valid data and publish outbound Request messages', async done => {
          await createOutboundEventManagementExchange(consumerMS, iocContainer)
          const rfp = createRFPInDb()
          const requestAction = createRequestActionInDb(rfp)

          const rfpReply: CreateRFPReplyRequest = { responseData: FAKE_ACTION_DATA }

          await postRFPReplySuccess(rfp, actionType, rfpReply, requestAction)

          await assertActionsProcessedInDb(rfp.staticId, [requestAction.senderStaticID], actionType, FAKE_ACTION_DATA)
          await assertValidOuboundMessage(consumerMS, iocContainer, rfp, actionType, requestAction.senderStaticID, done)
        })

        it('should fail to publish action and then succeed on retry', async done => {
          const rfp = createRFPInDb()
          const requestAction = createRequestActionInDb(rfp)
          const rfpReply: CreateRFPReplyRequest = { responseData: FAKE_ACTION_DATA }

          await iEnv.stopRabbitMQ()
          await postRFPReplyFailsWithInternalMQError(rfp, actionType, rfpReply)

          await iEnv.startRabbitMQ()
          await createOutboundEventManagementExchange(consumerMS, iocContainer)

          await postRFPReplySuccess(rfp, actionType, rfpReply, requestAction)

          await assertMostRecentActionProcessed(rfp, actionType)
          await assertValidOuboundMessage(consumerMS, iocContainer, rfp, actionType, requestAction.senderStaticID, done)
        })
      })

      describe('failure', () => {
        it('should fail creation if action fails to publish', async () => {
          await iEnv.stopRabbitMQ()
          const rfp = createRFPInDb()
          createRequestActionInDb(rfp)
          const rfpReply: CreateRFPReplyRequest = { responseData: FAKE_ACTION_DATA }

          expect.assertions(2)
          await postRFPReplyFailsWithInternalMQError(rfp, actionType, rfpReply)

          await iEnv.startRabbitMQ()
        })
      })

      it('should fail creation if the RFP cannot be found', async () => {
        await iEnv.stopRabbitMQ()
        const rfpReply: CreateRFPReplyRequest = { responseData: FAKE_ACTION_DATA }

        expect.assertions(2)
        await postRFPReplyFailsWithNotFoundError(actionType, rfpReply)

        await iEnv.startRabbitMQ()
      })

      it(`should not allow a ${actionType} creation after the RFP was rejected`, async done => {
        await createOutboundEventManagementExchange(consumerMS, iocContainer)
        const rfp = createRFPInDb()
        const requestAction = createRequestActionInDb(rfp)
        const rfpReply: CreateRFPReplyRequest = { responseData: FAKE_ACTION_DATA }
        await postRFPReplySuccess(rfp, ActionType.Reject, rfpReply, requestAction) //  create previous Reject
        assertValidOuboundMessage(consumerMS, iocContainer, rfp, ActionType.Reject, requestAction.senderStaticID, done)

        // fails to create new Reply (Response or Reject)
        try {
          await postAPI(rfp.staticId, actionType, rfpReply)
          fail('Expected failure')
        } catch (e) {
          expect(e.response.status).toBe(409)
          expect(e.response.data.errorCode).toEqual(ErrorCode.ValidationHttpContent)
        }
      })
    })
  })

  async function postAPI(rfpId: string, actionType: ActionType, data?: any) {
    if (actionType === ActionType.Response) {
      return axiosInstance.post(`/response/${rfpId}`, data)
    } else if (actionType === ActionType.Reject) {
      return axiosInstance.post(`/reject/${rfpId}`, data)
    }
  }

  async function postRFPReplyFailsWithInternalMQError(
    rfp: IRequestForProposal,
    actionType: ActionType,
    rfpReply: CreateRFPReplyRequest
  ) {
    try {
      await postAPI(rfp.staticId, actionType, rfpReply)
    } catch (e) {
      expect(e.response.data.errorCode).toEqual(ErrorCode.ConnectionInternalMQ)
      expect(e.response.status).toEqual(500)
    }
  }

  function createRFPInDb() {
    const rfp = buildFakeRequestForProposalExtended(true)
    RequestForProposal.create(rfp)
    return rfp
  }

  function createRequestActionInDb(rfp: IRequestForProposal) {
    const requestAction = buildFakeActionExtended(ActionType.Request, true)
    requestAction.rfpId = rfp.staticId
    requestAction.status = ActionStatus.Processed
    Action.create(requestAction)
    return requestAction
  }

  async function postRFPReplySuccess(
    rfp: IRequestForProposal,
    actionType: ActionType,
    rfpReply: CreateRFPReplyRequest,
    existentRequestAction: IAction
  ) {
    const result = await postAPI(rfp.staticId, actionType, rfpReply)
    const expectedActionStatus = {
      recipientStaticId: existentRequestAction.senderStaticID,
      status: ActionStatus.Processed
    }
    expect(result.data).toMatchObject({ rfpId: rfp.staticId, actionStatus: expectedActionStatus })
  }

  async function postRFPReplyFailsWithNotFoundError(actionType: ActionType, rfpReply: CreateRFPReplyRequest) {
    try {
      await postAPI('invalidRFPId', actionType, rfpReply)
    } catch (e) {
      expect(e.response.status).toBe(404)
      expect(e.response.data.errorCode).toEqual(ErrorCode.ValidationHttpContent)
    }
  }
})
