import { AMQPUtility, ConsumerMicroservice } from '@komgo/integration-test-utilities'
import { IRFPPayload, IRFPMessage } from '@komgo/messaging-types'
import { ActionType, IAction, ActionStatus, IRequestForProposal } from '@komgo/types'
// @ts-ignore
import * as waitForExpect from 'wait-for-expect'

import {
  IRFPActionMessage,
  IActionPayload,
  IResponsePayload,
  IRequestPayload
} from '../../src/business-layer/messaging/types'
import { buildInternalRoutingKey } from '../../src/business-layer/messaging/utils'
import { Action } from '../../src/data-layer/models/mongo/Action'
import { RequestForProposal } from '../../src/data-layer/models/mongo/RequestForProposal'

import IntegrationEnvironment from './IntegrationEnvironment'

const INTERNAL_ROUTING_KEY_BIND = 'INTERNAL.RFP.tradeFinance.rd.#'
const MOCK_RESPONSE_DATA = { data: 'mockResponseData' }

export class ProcessActionAssertUtils {
  constructor(
    private readonly actionType: ActionType,
    private readonly consumerMicroservice: ConsumerMicroservice,
    private readonly amqpUtility: AMQPUtility,
    private readonly deadQueueName: string
  ) {}

  public async assertActionsProcessedInDb(rfpId: string, participantStaticIds: string[], data?: any) {
    // check it exists in the DB
    const actions: IAction[] = await Action.find({ rfpId, type: this.actionType })
    expect(actions).toBeDefined()
    expect(actions.length).toBe(participantStaticIds.length)

    this.assertActionsValid(actions, rfpId, data)
    this.assertActionsCreatedForAllParticipants(actions, participantStaticIds)
  }

  public assertActionsValid(actions: IAction[], rfpId: string, data?: any) {
    for (const action of actions) {
      expect(action.rfpId).toEqual(rfpId)
      expect(action.senderStaticID).toEqual(IntegrationEnvironment.COMPANY_STATIC_ID)
      expect(action.type).toEqual(this.actionType)
      expect(action.status).toEqual(ActionStatus.Processed)
      expect(new Date(action.sentAt).getTime()).toBeLessThan(new Date().getTime())
      if (data) {
        expect(action.data).toMatchObject(data)
      }
    }
  }

  public async assertActionsCreatedForAllParticipants(actions: IAction[], participantStaticIds: string[]) {
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

  public async assertNoRejectedMessage() {
    // @ts-ignore
    await waitForExpect(async () => {
      expect(await this.amqpUtility.hasMessageOnQueue(this.deadQueueName)).toBeFalsy()
    })
  }

  public async assertRejectedMessage(messageId: string) {
    // @ts-ignore
    await waitForExpect(async () => {
      expect(await this.amqpUtility.hasMessageOnQueue(this.deadQueueName)).toBeTruthy()

      const rejectedMessage = await this.amqpUtility.getMessageOnQueue(this.deadQueueName)
      expect(rejectedMessage).toBeDefined()

      expect(rejectedMessage.properties.messageId).toEqual(messageId)
    })
  }

  public async assertRFPMessageInDatabase(rfpMessage: IRFPActionMessage<IActionPayload>) {
    if (this.actionType === ActionType.Request) {
      await this.assertRequestRFPMessageInDatabase(rfpMessage as IRFPActionMessage<IRequestPayload>)
    } else if (
      this.actionType === ActionType.Response ||
      this.actionType === ActionType.Reject ||
      this.actionType === ActionType.Accept
    ) {
      await this.assertReplyRFPMessageInDatabase(rfpMessage as IRFPActionMessage<IResponsePayload>)
    }
  }

  public async assertRequestRFPMessageInDatabase(rfpMessage: IRFPActionMessage<IRequestPayload>) {
    // @ts-ignore
    await waitForExpect(async () => {
      const savedRFP: IRequestForProposal = await RequestForProposal.findOne({ staticId: rfpMessage.data.rfp.rfpId })

      expect(savedRFP).toBeDefined()
      expect(savedRFP.context).toEqual(rfpMessage.context)
      expect(savedRFP.documentIds).toEqual(expect.arrayContaining(rfpMessage.data.documentIds))
      expect(savedRFP.productRequest).toEqual(rfpMessage.data.productRequest)

      const savedAction: IAction = await Action.findOne({ staticId: rfpMessage.data.rfp.actionId })
      this.assertActionMatchesRfpMessage(savedAction, rfpMessage)
    })
  }

  public async assertReplyRFPMessageInDatabase(rfpMessage: IRFPActionMessage<IResponsePayload>) {
    // @ts-ignore
    await waitForExpect(async () => {
      const savedAction: IAction = await Action.findOne({ staticId: rfpMessage.data.rfp.actionId })

      this.assertActionMatchesRfpMessage(savedAction, rfpMessage)
      expect(savedAction.data).toMatchObject(rfpMessage.data.response)
    })
  }

  public async assertInternalMessage(rfpMessage: IRFPActionMessage<IActionPayload>, done?: jest.DoneCallback) {
    const expectedMessage = this.createExpectedInternalMessageFromRFPMessage(rfpMessage)
    await this.consumerMicroservice.expectMessage(
      INTERNAL_ROUTING_KEY_BIND,
      {
        hasError: false,
        routingKey: buildInternalRoutingKey(this.actionType, rfpMessage.context),
        content: expectedMessage
      },
      done
    )
  }

  public assertActionMatchesRfpMessage(savedAction: IAction, rfpMessage: IRFPActionMessage<IActionPayload>) {
    expect(savedAction).toBeDefined()
    expect(savedAction.recipientStaticID).toEqual(rfpMessage.data.rfp.recipientStaticID)
    expect(savedAction.senderStaticID).toEqual(rfpMessage.data.rfp.senderStaticID)
    expect(savedAction.rfpId).toEqual(rfpMessage.data.rfp.rfpId)
    expect(savedAction.status).toEqual(ActionStatus.Processed)
    expect(savedAction.type).toEqual(this.actionType)
    expect(savedAction.sentAt).toEqual(new Date(rfpMessage.data.rfp.sentAt))
  }

  private createExpectedInternalMessageFromRFPMessage(
    rfpMessage: IRFPActionMessage<IActionPayload>
  ): IRFPMessage<IRFPPayload> {
    const payload = this.createPayload(rfpMessage)
    return {
      version: 1,
      context: rfpMessage.context,
      data: payload
    }
  }

  private createPayload(rfpMessage: IRFPActionMessage<IActionPayload>): IRFPPayload {
    let payload
    if (
      this.actionType === ActionType.Response ||
      this.actionType === ActionType.Reject ||
      this.actionType === ActionType.Accept ||
      this.actionType === ActionType.Decline
    ) {
      payload = {
        rfpId: rfpMessage.data.rfp.rfpId,
        senderStaticID: rfpMessage.data.rfp.senderStaticID,
        response: MOCK_RESPONSE_DATA
      }
    } else if (this.actionType === ActionType.Request) {
      const rfpReqMsg = rfpMessage as IRFPActionMessage<IRequestPayload>
      payload = {
        rfpId: rfpReqMsg.data.rfp.rfpId,
        senderStaticID: rfpMessage.data.rfp.senderStaticID,
        productRequest: rfpReqMsg.data.productRequest,
        documentIds: rfpReqMsg.data.documentIds
      }
    }
    return payload
  }
}
