import { ErrorCode } from '@komgo/error-utilities'
import { ConsumerMicroservice } from '@komgo/integration-test-utilities'
import {
  IRequestForProposalBase,
  buildFakeRequestForProposalBase,
  ActionStatus,
  ActionType,
  IAction,
  ICreateRFPResponse
} from '@komgo/types'
import Axios from 'axios'
import { Container } from 'inversify'

import { IRFPActionMessage, IRequestPayload } from '../src/business-layer/messaging/types'
import { buildMessageType } from '../src/business-layer/messaging/utils'
import { RequestForProposal } from '../src/data-layer/models/mongo/RequestForProposal'
import { VALUES } from '../src/inversify/values'
import CreateRFPRequest from '../src/service-layer/requests/CreateRFPRequest'

import IntegrationEnvironment from './utils/IntegrationEnvironment'
import { createOutboundEventManagementExchange, removeArrayElement, assertActionsProcessedInDb } from './utils/utils'
jest.setTimeout(90000)
/**
 * This integration test uses a MongoDB real container.
 */
describe('RequestActionController integration test', () => {
  let iEnv: IntegrationEnvironment
  let consumerMicroservice: ConsumerMicroservice
  let rfpData: IRequestForProposalBase
  let iocContainer: Container

  const axiosInstance = Axios.create({
    baseURL: 'http://localhost:8080/v0/'
  })

  const participantStaticIds = ['123', '345', '678']

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
    rfpData = buildFakeRequestForProposalBase()
  })

  describe('Create Request Action', () => {
    beforeEach(async () => {
      consumerMicroservice = new ConsumerMicroservice(iocContainer.get(VALUES.OutboundPublisherId))
      await consumerMicroservice.beforeEach()
    })

    afterEach(async () => {
      await consumerMicroservice.afterEach()
    })

    describe('success', () => {
      it('should create rfp data with valid data and publish outbound Request messages', async done => {
        const rfpRequest: CreateRFPRequest = { rfp: rfpData, participantStaticIds }
        await createOutboundEventManagementExchange(consumerMicroservice, iocContainer)

        const response = await postAPI(rfpRequest)

        // check it exists in the DB
        const savedRd = await RequestForProposal.findOne({ staticId: response.data.staticId })

        expect(savedRd).toBeDefined()
        expect(response.data.staticId).toEqual(savedRd.staticId)
        expect(response.data.actionStatuses.length).toEqual(participantStaticIds.length)
        for (const actionStatus of response.data.actionStatuses) {
          expect(actionStatus.status).toBe(ActionStatus.Processed)
        }
        await assertActionsProcessedInDb(savedRd.staticId, participantStaticIds, ActionType.Request)
        await assertValidOuboundMessages(response.data, done)
      })
    })

    describe('failure', () => {
      it('should fail creation if there are no participants sent', async () => {
        const rfpRequest: CreateRFPRequest = { rfp: rfpData, participantStaticIds: [] }
        expect.assertions(1)
        try {
          await postAPI(rfpRequest)
        } catch (e) {
          expect(e.response.status).toBe(422)
        }
      })

      it('should fail creation if all actions fail to publish', async () => {
        await iEnv.stopRabbitMQ()
        const rfpRequest: CreateRFPRequest = { rfp: rfpData, participantStaticIds }

        expect.assertions(1)
        try {
          await postAPI(rfpRequest)
        } catch (e) {
          expect(e.response.data.errorCode).toEqual(ErrorCode.ConnectionInternalMQ)
        }
        await iEnv.startRabbitMQ()
      })
    })
  })

  describe('Get Request Actions', () => {
    it('should get actions for rfpId ', async () => {
      const rfpRequest: CreateRFPRequest = { rfp: rfpData, participantStaticIds }

      const createResponse = await postAPI(rfpRequest)
      const actionsResponse = await axiosInstance.get(`/request/${createResponse.data.staticId}/actions`)

      assertActionsValid(actionsResponse.data.actions, createResponse.data.staticId)
    })

    it('should fail with 404 when RFP does not exist ', async () => {
      const fakeRFPId = '123'
      expect.assertions(1)
      try {
        await axiosInstance.get(`/request/${fakeRFPId}/actions`)
      } catch (error) {
        expect(error.response.status).toBe(404)
      }
    })
  })

  async function postAPI(data?: any) {
    return axiosInstance.post('/request', data)
  }

  function assertActionsValid(actions: IAction[], rfpId: string) {
    for (const action of actions) {
      expect(action.rfpId).toEqual(rfpId)
      expect(action.senderStaticID).toEqual(IntegrationEnvironment.COMPANY_STATIC_ID)
      expect(action.type).toEqual(ActionType.Request)
      expect(action.status).toEqual(ActionStatus.Processed)
      expect(new Date(action.sentAt).getTime()).toBeLessThan(new Date().getTime())
    }
  }

  async function assertValidOuboundMessages(responseData: ICreateRFPResponse, done: jest.DoneCallback) {
    // tslint:disable-next-line
    const recipientStaticIds = Object.assign([], participantStaticIds)
    await consumerMicroservice.messagingConsumer.listen(
      iocContainer.get(VALUES.OutboundPublisherId),
      buildMessageType(ActionType.Request),
      async received => {
        received.ack()

        const message = received.content as IRFPActionMessage<IRequestPayload>

        expect(message.context).toEqual(rfpData.context)
        expect(message.messageType).toEqual('KOMGO.RFP.Request')
        expect(message.data.productRequest).toEqual(rfpData.productRequest)
        expect(message.data.documentIds).toEqual(rfpData.documentIds)
        expect(message.data.rfp.rfpId).toEqual(responseData.staticId)
        expect(message.data.rfp.sentAt).toBeDefined()
        expect(new Date(message.data.rfp.sentAt).getTime()).toBeLessThan(new Date().getTime())
        expect(message.data.rfp.senderStaticID).toEqual(iocContainer.get(VALUES.CompanyStaticId))
        expect(participantStaticIds.includes(message.data.rfp.recipientStaticID)).toBeTruthy()
        removeArrayElement(recipientStaticIds, message.data.rfp.recipientStaticID)

        if (recipientStaticIds.length === 0) {
          done()
        }
      }
    )
  }
})
