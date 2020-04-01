import { ConsumerMicroservice } from '@komgo/integration-test-utilities'
import {
  ActionType,
  IAction,
  ActionStatus,
  IRequestForProposal,
  buildFakeActionExtended,
  buildFakeRequestForProposalExtended
} from '@komgo/types'
import { Container } from 'inversify'

import { buildFakeReplyRFPMessage, buildFakeReplyActionPayload } from '../../src/business-layer/messaging/faker'
import { IRFPActionMessage, IResponsePayload } from '../../src/business-layer/messaging/types'
import { buildMessageType } from '../../src/business-layer/messaging/utils'
import { Action } from '../../src/data-layer/models/mongo/Action'
import { RequestForProposal } from '../../src/data-layer/models/mongo/RequestForProposal'
import { VALUES } from '../../src/inversify/values'

import IntegrationEnvironment from './IntegrationEnvironment'

export const FAKE_ACTION_DATA = { fakeData: 'hello' }

export function removeArrayElement<T>(myArray: T[], element: T) {
  const index = myArray.indexOf(element, 0)
  if (index > -1) {
    myArray.splice(index, 1)
  }
}

export async function createInternalConsumerQueue(
  consumerMicroservice: ConsumerMicroservice,
  iocContainer: Container,
  routingKey: string
) {
  // add listener to create exchange to simulate event-mgnt
  const listenId = await consumerMicroservice.messagingConsumer.listen(
    iocContainer.get(VALUES.InternalPublisherId),
    routingKey,
    // tslint:disable-next-line: no-empty
    async _ => {}
  )
  await consumerMicroservice.messagingConsumer.cancel(listenId)
}

export async function createOutboundEventManagementExchange(
  consumerMicroservice: ConsumerMicroservice,
  iocContainer: Container
) {
  // add listener to create exchange to simulate event-mgnt
  const listenId = await consumerMicroservice.messagingConsumer.listen(
    iocContainer.get(VALUES.OutboundPublisherId),
    '#',
    // tslint:disable-next-line: no-empty
    async _ => {}
  )
  consumerMicroservice.messagingConsumer.cancel(listenId)
}

export async function assertMostRecentActionProcessed(rfp: IRequestForProposal, actionType: ActionType) {
  const actions: IAction[] = await Action.find({ rfpId: rfp.staticId, type: actionType }).sort({
    createdAt: -1
  })
  expect(actions.length).toBe(2)
  expect(actions[0].status).toBe(ActionStatus.Processed)
  // check that the most recent action is the one that was processed
  expect(new Date(actions[0].createdAt).getTime()).toBeGreaterThan(new Date(actions[1].createdAt).getTime())
  expect(actions[1].status).toBe(ActionStatus.Failed)
}

export async function assertActionsProcessedInDb(
  rfpId: string,
  participantStaticIds: string[],
  actionType: ActionType,
  data?: any
) {
  // check it exists in the DB
  const actions: IAction[] = await Action.find({ rfpId, type: actionType })
  expect(actions).toBeDefined()
  expect(actions.length).toBe(participantStaticIds.length)

  assertActionsValid(actions, rfpId, actionType, data)
  assertActionsCreatedForAllParticipants(actions, participantStaticIds)
}

function assertActionsValid(actions: IAction[], rfpId: string, actionType: ActionType, data?: any) {
  for (const action of actions) {
    expect(action.rfpId).toEqual(rfpId)
    expect(action.senderStaticID).toEqual(IntegrationEnvironment.COMPANY_STATIC_ID)
    expect(action.type).toEqual(actionType)
    expect(action.status).toEqual(ActionStatus.Processed)
    expect(new Date(action.sentAt).getTime()).toBeLessThan(new Date().getTime())
    if (data) {
      expect(action.data).toMatchObject(data)
    }
  }
}

async function assertActionsCreatedForAllParticipants(actions: IAction[], participantStaticIds: string[]) {
  for (const participantId of participantStaticIds) {
    let matchingAction = false
    for (const action of actions) {
      if (action.recipientStaticID === participantId) {
        matchingAction = true
        break
      }
    }
    expect(matchingAction).toBeTruthy()
  }
}

export function createReplyMessage(
  rfpId: string,
  actionType: ActionType,
  recipient: string,
  sender: string,
  data?: any
): IRFPActionMessage<IResponsePayload> {
  const rfpMsg: IRFPActionMessage<IResponsePayload> = buildFakeReplyRFPMessage(
    buildFakeReplyActionPayload(true),
    actionType
  )
  rfpMsg.data.rfp.rfpId = rfpId
  rfpMsg.data.rfp.recipientStaticID = recipient
  rfpMsg.data.rfp.senderStaticID = sender
  rfpMsg.data.response = data

  return rfpMsg
}

export async function createProcessedActionInDb(
  rfpId: string,
  actionType: ActionType,
  sender: string,
  recipient: string,
  data?: any
) {
  const action: IAction = buildFakeActionExtended(actionType, true)
  action.senderStaticID = sender
  action.recipientStaticID = recipient
  action.rfpId = rfpId
  action.status = ActionStatus.Processed
  action.data = data
  await Action.create(action)
  return action
}

export async function createRFPInDb(): Promise<IRequestForProposal> {
  const rfp = buildFakeRequestForProposalExtended(true)
  return RequestForProposal.create(rfp)
}

export async function assertValidOuboundMessage(
  consumerMicroservice: ConsumerMicroservice,
  iocContainer: Container,
  rfp: IRequestForProposal,
  actionType: ActionType,
  expectedRecipient: string,
  done?: jest.DoneCallback
) {
  // tslint:disable-next-line
  await consumerMicroservice.messagingConsumer.listen(
    iocContainer.get(VALUES.OutboundPublisherId),
    buildMessageType(actionType),
    async received => {
      received.ack()
      const message = received.content as IRFPActionMessage<IResponsePayload>

      expect(message.context).toEqual(rfp.context)
      expect(message.messageType).toEqual(buildMessageType(actionType))
      expect(message.data.rfp.rfpId).toEqual(rfp.staticId)
      expect(message.data.rfp.sentAt).toBeDefined()
      expect(new Date(message.data.rfp.sentAt).getTime()).toBeLessThan(new Date().getTime())
      expect(message.data.rfp.senderStaticID).toEqual(iocContainer.get(VALUES.CompanyStaticId))
      expect(message.data.rfp.recipientStaticID).toBe(expectedRecipient)
      expect(message.data.response).toMatchObject(FAKE_ACTION_DATA)
      if (done) {
        done()
      }
    }
  )
}
