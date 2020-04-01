import {
  IRequestForProposal,
  buildFakeRequestForProposalExtended,
  IAction,
  buildFakeActionExtended,
  ActionType
} from '@komgo/types'
import 'reflect-metadata'

import InvalidActionTypeError from './InvalidActionTypeError'
import OutboundMessageCreateError from './OutboundMessageCreateError'
import OutboundMessageFactory from './OutboundMessageFactory'
import { IRequestPayload, IRFPActionMessage, IResponsePayload, IActionPayload } from './types'
import { buildMessageType } from './utils'

describe('OutboundMessageFactory', () => {
  let outboundMessageFactory: OutboundMessageFactory

  beforeEach(() => {
    outboundMessageFactory = new OutboundMessageFactory()
  })

  it('should create AMQP RFP Request message with same rfpId', async () => {
    const rfp: IRequestForProposal = buildFakeRequestForProposalExtended()
    const action: IAction = buildFakeActionExtended(ActionType.Request)

    const message = outboundMessageFactory.createMessage(rfp, action) as IRFPActionMessage<IRequestPayload>

    assertCommonRFPMessageFieldsValid(message, rfp, action)
    expect(message.data.productRequest).toEqual(rfp.productRequest)
    expect(message.data.documentIds).toEqual(rfp.documentIds)
  })

  it('should fail to create AMQP RFP Request message with different rfpId', async () => {
    const rfp: IRequestForProposal = buildFakeRequestForProposalExtended(true)
    const action: IAction = buildFakeActionExtended(ActionType.Request, true)

    expect.assertions(1)
    try {
      outboundMessageFactory.createMessage(rfp, action)
    } catch (e) {
      expect(e).toBeInstanceOf(OutboundMessageCreateError)
    }
  })

  it('should create AMQP RFP Response message with same rfpId', async () => {
    const rfp: IRequestForProposal = buildFakeRequestForProposalExtended()
    const action: IAction = buildFakeActionExtended(ActionType.Response)
    action.data = { data: 'mockData' }

    const message = outboundMessageFactory.createMessage(rfp, action) as IRFPActionMessage<IResponsePayload>

    assertCommonRFPMessageFieldsValid(message, rfp, action)
    expect(message.data.response).toEqual(action.data)
  })

  it('should fail if an invalid ActionType is used', async () => {
    const rfp: IRequestForProposal = buildFakeRequestForProposalExtended()
    const action: IAction = buildFakeActionExtended(ActionType.Response)
    // tslint:disable-next-line
    action.type = 'InvalidType'
    action.data = { data: 'mockData' }

    expect(() => outboundMessageFactory.createMessage(rfp, action)).toThrowError(InvalidActionTypeError)
  })
})
function assertCommonRFPMessageFieldsValid(
  message: IRFPActionMessage<IActionPayload>,
  rfp: IRequestForProposal,
  action: IAction
) {
  expect(message.messageType).toEqual(buildMessageType(action.type))
  expect(message.context).toEqual(rfp.context)
  expect(message.data.rfp.rfpId).toEqual(rfp.staticId)
  expect(message.data.rfp.actionId).toEqual(action.staticId)
  expect(message.data.rfp.recipientStaticID).toEqual(action.recipientStaticID)
  expect(message.data.rfp.senderStaticID).toEqual(action.senderStaticID)
}
