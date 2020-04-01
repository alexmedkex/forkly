import {
  IRequestForProposalBase,
  IAction,
  buildFakeRequestForProposalBase,
  buildFakeActionExtended,
  ActionType,
  ActionStatus
} from '@komgo/types'
// tslint:disable-next-line
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { RequestForProposalDataAgent } from '../../../data-layer/data-agents/RequestForProposalDataAgent'
import SaveEntityError from '../../errors/SaveEntityError'

import { CreateRequestUseCase } from './CreateRequestUseCase'

describe('CreateRequestUseCase', () => {
  let rfpBaseData: IRequestForProposalBase
  let actionData: IAction
  let mockRfpDataAgent: jest.Mocked<RequestForProposalDataAgent>
  let mockActionDataAgent: jest.Mocked<ActionDataAgent>
  let createRequestUseCase: CreateRequestUseCase

  const MOCK_STATIC_ID = '0b88f604-ded8-4fa1-a419-701406214123'
  const COMPANY_STATIC_ID = '123-456-789'
  const participantIds = ['123', '567', '789']

  beforeEach(() => {
    jest.resetAllMocks()
    mockRfpDataAgent = createMockInstance(RequestForProposalDataAgent)
    mockActionDataAgent = createMockInstance(ActionDataAgent)
    rfpBaseData = buildFakeRequestForProposalBase()
    actionData = buildFakeActionExtended(ActionType.Request, true)

    createRequestUseCase = new CreateRequestUseCase(mockRfpDataAgent, mockActionDataAgent, COMPANY_STATIC_ID)
  })

  it('creates the RFP and an action per pariticpantId', async () => {
    mockRfpDataAgent.create.mockResolvedValue({ staticId: MOCK_STATIC_ID, ...rfpBaseData })
    mockActionDataAgent.create.mockResolvedValue(actionData)
    const actionCreateSpy = jest.spyOn(mockActionDataAgent, 'create')

    const staticId = await createRequestUseCase.execute(rfpBaseData, participantIds)

    expect(staticId).toBe(MOCK_STATIC_ID)
    assertActionDataAgentCallMatches(actionCreateSpy.mock.calls[0][0], participantIds[0])
    assertActionDataAgentCallMatches(actionCreateSpy.mock.calls[1][0], participantIds[1])
    assertActionDataAgentCallMatches(actionCreateSpy.mock.calls[2][0], participantIds[2])
  })

  it('throws a SaveEntityError when the second action fails to save', async () => {
    mockRfpDataAgent.create.mockResolvedValue({ staticId: MOCK_STATIC_ID, ...rfpBaseData })
    mockActionDataAgent.create.mockResolvedValueOnce(actionData)
    mockActionDataAgent.create.mockRejectedValueOnce(new Error())
    const actionCreateSpy = jest.spyOn(mockActionDataAgent, 'create')

    await expect(createRequestUseCase.execute(rfpBaseData, participantIds)).rejects.toThrowError(SaveEntityError)

    assertActionDataAgentCallMatches(actionCreateSpy.mock.calls[0][0], participantIds[0])
    assertActionDataAgentCallMatches(actionCreateSpy.mock.calls[1][0], participantIds[1])
    // it will not try to save the last action as the 2nd one errored
    expect(actionCreateSpy.mock.calls[2]).toBeUndefined()
  })

  it('throws a SaveEntityError when the initial rfp fails to save', async () => {
    mockRfpDataAgent.create.mockRejectedValue(new Error())

    await expect(createRequestUseCase.execute(rfpBaseData, participantIds)).rejects.toThrowError(SaveEntityError)

    expect(mockActionDataAgent.create).not.toBeCalled()
  })

  function assertActionDataAgentCallMatches(spyCall: {}, recipientId: string) {
    expect(spyCall).toMatchObject({
      rfpId: MOCK_STATIC_ID,
      recipientStaticID: recipientId,
      senderStaticID: COMPANY_STATIC_ID,
      type: ActionType.Request,
      status: ActionStatus.Created
    })
  }
})
