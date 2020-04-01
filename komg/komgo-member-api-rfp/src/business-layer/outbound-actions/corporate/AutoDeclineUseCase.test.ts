import {
  IAction,
  buildFakeActionExtended,
  ActionType,
  ActionStatus,
  buildFakeRequestForProposalExtended
} from '@komgo/types'
// tslint:disable-next-line
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { OutboundActionProcessor } from '../../actions/OutboundActionProcessor'
import { RFPValidator } from '../../validation/RFPValidator'

import { AutoDeclineUseCase } from './AutoDeclineUseCase'
import { CreateDeclineUseCase } from './CreateDeclineUseCase'

describe('AutoDeclineUseCase', () => {
  const RFP_ID = 'rfp123'

  let mockRFPValidator: jest.Mocked<RFPValidator>
  let mockActionDataAgent: jest.Mocked<ActionDataAgent>
  let mockOutboundActionProcessor: jest.Mocked<OutboundActionProcessor>
  let mockCreateDeclineUseCase: jest.Mocked<CreateDeclineUseCase>

  let autoDeclineUseCase: AutoDeclineUseCase

  beforeEach(() => {
    jest.resetAllMocks()
    mockRFPValidator = createMockInstance(RFPValidator)
    mockActionDataAgent = createMockInstance(ActionDataAgent)
    mockOutboundActionProcessor = createMockInstance(OutboundActionProcessor)
    mockCreateDeclineUseCase = createMockInstance(CreateDeclineUseCase)

    autoDeclineUseCase = new AutoDeclineUseCase(
      mockRFPValidator,
      mockOutboundActionProcessor,
      mockActionDataAgent,
      mockCreateDeclineUseCase
    )
  })

  it('should auto-decline 2 banks (1 with response and 1 without) and ignore 3 banks (1 with reject, 1 already declined and 1 already accepted)', async () => {
    const rfp = buildFakeRequestForProposalExtended()
    mockRFPValidator.validateRFPExists.mockResolvedValueOnce(rfp)
    const requestBank1 = buildFakeRequest()
    const requestBank2 = buildFakeRequest()
    const requestBank3 = buildFakeRequest()
    const requestBank4 = buildFakeRequest()
    const requestBank5 = buildFakeRequest()
    mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValueOnce([
      requestBank1,
      requestBank2,
      requestBank3,
      requestBank4,
      requestBank5
    ])
    const rejectBank3 = buildFakeAction(ActionType.Reject, requestBank3.recipientStaticID, requestBank3.senderStaticID)
    mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValueOnce([rejectBank3])
    const declineBank4 = buildFakeAction(
      ActionType.Decline,
      requestBank4.senderStaticID,
      requestBank4.recipientStaticID
    )
    const acceptBank5 = buildFakeAction(ActionType.Accept, requestBank5.senderStaticID, requestBank5.recipientStaticID)
    mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValueOnce([declineBank4, acceptBank5])
    const declineForBank1 = buildFakeAction(
      ActionType.Decline,
      requestBank1.senderStaticID,
      requestBank1.recipientStaticID
    )
    const declineForBank2 = buildFakeAction(
      ActionType.Decline,
      requestBank2.senderStaticID,
      requestBank2.recipientStaticID
    )
    mockActionDataAgent.findByRFPIdAndActionType.mockResolvedValue([declineForBank1, declineForBank2])

    await autoDeclineUseCase.execute(RFP_ID)

    expect(mockCreateDeclineUseCase.execute).toBeCalledTimes(2)
    expect(mockActionDataAgent.findByRFPIdAndActionType).toBeCalledTimes(1)
    expect(mockActionDataAgent.findByRFPIdAndActionType).toBeCalledWith(
      RFP_ID,
      ActionType.Decline,
      ActionStatus.Created
    )
    expect(mockCreateDeclineUseCase.execute).toBeCalledWith(RFP_ID, requestBank1.recipientStaticID)
    expect(mockCreateDeclineUseCase.execute).toBeCalledWith(RFP_ID, requestBank2.recipientStaticID)
    expect(mockOutboundActionProcessor.processActions).toBeCalledWith(rfp, [declineForBank1, declineForBank2])
  })

  it('should ignore auto-decline if no requests were done', async () => {
    mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValue([])

    await autoDeclineUseCase.execute(RFP_ID)

    expect(mockCreateDeclineUseCase.execute).toBeCalledTimes(0)
  })

  function buildFakeRequest(): IAction {
    const request: IAction = buildFakeActionExtended(ActionType.Request, true)
    request.recipientStaticID = uuid4()
    return request
  }

  function buildFakeAction(actionType: ActionType, senderStaticID: string, recipientStaticID: string): IAction {
    const request: IAction = buildFakeActionExtended(actionType, true)
    request.recipientStaticID = recipientStaticID
    request.senderStaticID = senderStaticID
    return request
  }
})
