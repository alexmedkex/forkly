import {
  IRequestForProposal,
  IAction,
  buildFakeRequestForProposalExtended,
  buildFakeActionExtended,
  ActionType,
  IOutboundActionResult,
  ActionStatus
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ActionDataAgent } from '../../data-layer/data-agents/ActionDataAgent'
import {
  buildFakeReplyActionPayload,
  buildFakeRequestRFPMessage,
  buildFakeRequestActionPayload,
  buildFakeReplyRFPMessage
} from '../messaging/faker'
import OutboundMessageFactory from '../messaging/OutboundMessageFactory'
import OutboundPublisher from '../messaging/OutboundPublisher'

import { OutboundActionProcessor } from './OutboundActionProcessor'

describe('OutboundActionProcessor', () => {
  let actionDataAgent: jest.Mocked<ActionDataAgent>
  let outboundMessageFactory: jest.Mocked<OutboundMessageFactory>
  let outboundPublisher: jest.Mocked<OutboundPublisher>
  let actionProcessor: OutboundActionProcessor
  let mockRfp: IRequestForProposal
  let mockAction: IAction

  beforeEach(() => {
    outboundPublisher = createMockInstance(OutboundPublisher)
    outboundMessageFactory = createMockInstance(OutboundMessageFactory)
    actionDataAgent = createMockInstance(ActionDataAgent)

    mockRfp = buildFakeRequestForProposalExtended(true)
    mockAction = buildFakeActionExtended(ActionType.Request)

    actionProcessor = new OutboundActionProcessor(outboundPublisher, outboundMessageFactory, actionDataAgent)
  })

  it('should process a request action successfully', async () => {
    const mockRequestPayload = buildFakeRequestActionPayload(true)
    const mockIRFPMsg = buildFakeRequestRFPMessage(mockRequestPayload)
    outboundMessageFactory.createMessage.mockReturnValue(mockIRFPMsg)
    outboundPublisher.send.mockResolvedValue('msgID123')

    const result: IOutboundActionResult = await actionProcessor.processAction(mockRfp, mockAction)

    expect(actionDataAgent.updateStatus).toBeCalledWith(mockAction.staticId, ActionStatus.Processed, mockAction.sentAt)
    expect(result.recipientStaticId).toEqual(mockAction.recipientStaticID)
    expect(result.status).toEqual(ActionStatus.Processed)
  })

  it('should process a response action successfully', async () => {
    const mockResponsePayload = buildFakeReplyActionPayload(true)
    const mockIRFPMsg = buildFakeReplyRFPMessage(mockResponsePayload, ActionType.Response)
    outboundMessageFactory.createMessage.mockReturnValue(mockIRFPMsg)
    outboundPublisher.send.mockResolvedValue('msgID123')

    const result: IOutboundActionResult = await actionProcessor.processAction(mockRfp, mockAction)

    expect(actionDataAgent.updateStatus).toBeCalledWith(mockAction.staticId, ActionStatus.Processed, mockAction.sentAt)
    expect(result.recipientStaticId).toEqual(mockAction.recipientStaticID)
    expect(result.status).toEqual(ActionStatus.Processed)
  })

  it('should return Failed status if the action fails processing', async () => {
    const mockResponsePayload = buildFakeReplyActionPayload(true)
    const mockIRFPMsg = buildFakeReplyRFPMessage(mockResponsePayload, ActionType.Response)
    outboundMessageFactory.createMessage.mockReturnValue(mockIRFPMsg)
    outboundPublisher.send.mockRejectedValue(new Error())

    const result: IOutboundActionResult = await actionProcessor.processAction(mockRfp, mockAction)

    expect(actionDataAgent.updateStatus).toBeCalledWith(mockAction.staticId, ActionStatus.Failed, mockAction.sentAt)
    expect(result.recipientStaticId).toEqual(mockAction.recipientStaticID)
    expect(result.status).toEqual(ActionStatus.Failed)
  })
})
