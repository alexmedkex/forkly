import {
  IRequestForProposal,
  buildFakeRequestForProposalExtended,
  IAction,
  buildFakeActionExtended,
  ActionType,
  ActionStatus,
  IOutboundActionResult
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { RequestForProposalDataAgent } from '../../../data-layer/data-agents/RequestForProposalDataAgent'
import { OutboundActionProcessor } from '../../actions/OutboundActionProcessor'
import FailedProcessRequestActionsError from '../../errors/FailedProcessRequestActionsError'
import NoActionsForRequestError from '../../errors/NoActionsForRequestError'

import SendOutboundRequestUseCase from './SendOutboundRequestUseCase'

describe('SendOutboundRequestUseCase', () => {
  let useCase: SendOutboundRequestUseCase

  let actionDataAgent: jest.Mocked<ActionDataAgent>
  let requestForProposalDataAgent: jest.Mocked<RequestForProposalDataAgent>
  let actionProcessor: jest.Mocked<OutboundActionProcessor>

  beforeEach(() => {
    actionDataAgent = createMockInstance(ActionDataAgent)
    requestForProposalDataAgent = createMockInstance(RequestForProposalDataAgent)
    actionProcessor = createMockInstance(OutboundActionProcessor)

    useCase = new SendOutboundRequestUseCase(actionDataAgent, requestForProposalDataAgent, actionProcessor)
  })

  it('should process 2 actions/participants on RFP successfully', async () => {
    const mockRfp: IRequestForProposal = buildFakeRequestForProposalExtended(true)
    const mockAction: IAction = buildFakeActionExtended(ActionType.Request)
    const mockActions: IAction[] = [mockAction, mockAction]

    requestForProposalDataAgent.findOneByStaticId.mockResolvedValueOnce(mockRfp)
    actionDataAgent.findByRFPIdAndActionType.mockResolvedValueOnce(mockActions)
    actionProcessor.processActions.mockResolvedValue([
      {
        recipientStaticId: mockAction.recipientStaticID,
        status: ActionStatus.Processed
      },
      {
        recipientStaticId: mockAction.recipientStaticID,
        status: ActionStatus.Processed
      }
    ])
    const result: IOutboundActionResult[] = await useCase.execute(mockRfp.staticId)

    expect(result.length).toBe(2)
    expect(result[0].recipientStaticId).toEqual(mockAction.recipientStaticID)
    expect(result[0].status).toEqual(ActionStatus.Processed)
    expect(result[1].recipientStaticId).toEqual(mockAction.recipientStaticID)
    expect(result[1].status).toEqual(ActionStatus.Processed)
  })

  it('should fail to proceess 1st action/participant and be successful in second one', async () => {
    const mockRfp: IRequestForProposal = buildFakeRequestForProposalExtended(true)
    const mockAction: IAction = buildFakeActionExtended(ActionType.Request)

    requestForProposalDataAgent.findOneByStaticId.mockResolvedValueOnce(mockRfp)
    actionDataAgent.findByRFPIdAndActionType.mockResolvedValueOnce([mockAction, mockAction])
    actionProcessor.processActions.mockResolvedValueOnce([
      { recipientStaticId: mockAction.recipientStaticID, status: ActionStatus.Failed },
      { recipientStaticId: mockAction.recipientStaticID, status: ActionStatus.Processed }
    ])

    const result: IOutboundActionResult[] = await useCase.execute(mockRfp.staticId)

    expect(result.length).toBe(2)
    expect(result[0].recipientStaticId).toEqual(mockAction.recipientStaticID)
    expect(result[0].status).toEqual(ActionStatus.Failed)
    expect(result[1].recipientStaticId).toEqual(mockAction.recipientStaticID)
    expect(result[1].status).toEqual(ActionStatus.Processed)
  })

  it('should throw error if there are no Request actions on Created status for RFP', async () => {
    const mockRfp: IRequestForProposal = buildFakeRequestForProposalExtended(true)

    requestForProposalDataAgent.findOneByStaticId.mockResolvedValue(mockRfp)
    actionDataAgent.findByRFPIdAndActionType.mockResolvedValue([])

    await expect(useCase.execute(mockRfp.staticId)).rejects.toThrow(NoActionsForRequestError)
  })

  it('should throw error if all actions failed to process', async () => {
    const mockRfp: IRequestForProposal = buildFakeRequestForProposalExtended(true)
    const mockAction: IAction = buildFakeActionExtended(ActionType.Request)

    requestForProposalDataAgent.findOneByStaticId.mockResolvedValueOnce(mockRfp)
    actionDataAgent.findByRFPIdAndActionType.mockResolvedValueOnce([mockAction, mockAction])
    actionProcessor.processActions.mockResolvedValue([
      {
        recipientStaticId: mockAction.recipientStaticID,
        status: ActionStatus.Failed
      }
    ])

    await expect(useCase.execute(mockRfp.staticId)).rejects.toThrow(FailedProcessRequestActionsError)
  })
})
