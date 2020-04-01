import {
  IRequestForProposal,
  IOutboundActionResult,
  IAction,
  buildFakeRequestForProposalExtended,
  buildFakeActionExtended,
  ActionType,
  ActionStatus
} from '@komgo/types'
// tslint:disable-next-line
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { OutboundActionProcessor } from '../actions/OutboundActionProcessor'
import FailedProcessReplyActionError from '../errors/FailedProcessReplyActionError'
import { RFPValidator } from '../validation/RFPValidator'

import SendOutboundReplyUseCase from './SendOutboundReplyUseCase'

describe('SendOutboundReplyUseCase', () => {
  let useCase: SendOutboundReplyUseCase
  let rfpValidator: jest.Mocked<RFPValidator>
  let actionProcessor: jest.Mocked<OutboundActionProcessor>
  let mockRfp: IRequestForProposal
  let outboundActionResult: IOutboundActionResult
  let mockAction: IAction

  beforeEach(() => {
    rfpValidator = createMockInstance(RFPValidator)
    actionProcessor = createMockInstance(OutboundActionProcessor)
    mockRfp = buildFakeRequestForProposalExtended(true)
    mockAction = buildFakeActionExtended(ActionType.Request)

    rfpValidator.validateRFPExists.mockResolvedValueOnce(mockRfp)
    rfpValidator.validateLatestActionExists.mockResolvedValueOnce(mockAction)

    outboundActionResult = {
      recipientStaticId: mockAction.recipientStaticID,
      status: ActionStatus.Processed
    }
    useCase = new SendOutboundReplyUseCase(rfpValidator, actionProcessor)
  })

  it('should process the response action successfully', async () => {
    actionProcessor.processAction.mockResolvedValue(outboundActionResult)

    const result: IOutboundActionResult = await useCase.execute(mockRfp.staticId, ActionType.Response)

    expect(result).toMatchObject(outboundActionResult)
  })

  it('should throw error if the action fails processing', async () => {
    actionProcessor.processAction.mockResolvedValueOnce({
      recipientStaticId: mockAction.recipientStaticID,
      status: ActionStatus.Failed
    })

    await expect(useCase.execute(mockRfp.staticId, ActionType.Response)).rejects.toThrowError(
      FailedProcessReplyActionError
    )
  })
})
