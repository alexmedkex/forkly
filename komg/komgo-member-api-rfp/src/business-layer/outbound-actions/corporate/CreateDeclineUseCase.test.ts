import { IAction, buildFakeActionExtended, ActionType } from '@komgo/types'
// tslint:disable-next-line
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { ActionFactory } from '../../actions/ActionFactory'
import SaveEntityError from '../../errors/SaveEntityError'
import { RFPValidator } from '../../validation/RFPValidator'

import { CreateDeclineUseCase } from './CreateDeclineUseCase'

describe('CreateDeclineUseCase', () => {
  const RFP_ID = 'rfp123'
  const RESPONSE_DATA = { data: 'mockData' }
  const PARTICIPANT_ID = 'part123'
  let responseActionData: IAction
  let requestActionData: IAction

  let mockActionDataAgent: jest.Mocked<ActionDataAgent>
  let mockActionFactory: jest.Mocked<ActionFactory>
  let mockRFPValidator: jest.Mocked<RFPValidator>

  let createDeclineUseCase: CreateDeclineUseCase

  beforeEach(() => {
    jest.resetAllMocks()
    mockActionDataAgent = createMockInstance(ActionDataAgent)
    mockActionFactory = createMockInstance(ActionFactory)
    mockRFPValidator = createMockInstance(RFPValidator)
    requestActionData = buildFakeActionExtended(ActionType.Request, true)
    responseActionData = buildFakeActionExtended(ActionType.Response, true)
    responseActionData.recipientStaticID = requestActionData.senderStaticID

    createDeclineUseCase = new CreateDeclineUseCase(mockActionDataAgent, mockActionFactory, mockRFPValidator)
  })

  it('creates the decline action', async () => {
    mockActionFactory.createActionBase.mockReturnValue(responseActionData)
    mockActionDataAgent.create.mockResolvedValue(responseActionData)
    const actionCreateSpy = jest.spyOn(mockActionDataAgent, 'create')

    const actionId = await createDeclineUseCase.execute(RFP_ID, PARTICIPANT_ID, RESPONSE_DATA)

    expect(actionId).toBe(responseActionData.staticId)
    expect(mockActionFactory.createActionBase).toBeCalledWith(RFP_ID, ActionType.Decline, PARTICIPANT_ID, RESPONSE_DATA)
    expect(actionCreateSpy.mock.calls[0][0]).toMatchObject(responseActionData)
    expect(mockRFPValidator.validateRFPExists).toBeCalledWith(RFP_ID)
    expect(mockRFPValidator.validateRejectNotReceivedFromParticipant).toBeCalledWith(RFP_ID, PARTICIPANT_ID)
    expect(mockRFPValidator.validateActionTypeNotSentToParticipant).toBeCalledWith(
      RFP_ID,
      ActionType.Decline,
      PARTICIPANT_ID
    )
    expect(mockRFPValidator.validateActionTypeNotSentToParticipant).toBeCalledWith(
      RFP_ID,
      ActionType.Accept,
      PARTICIPANT_ID
    )
  })

  it('creates the decline action without data', async () => {
    mockActionFactory.createActionBase.mockReturnValue(responseActionData)
    mockActionDataAgent.create.mockResolvedValue(responseActionData)
    const actionCreateSpy = jest.spyOn(mockActionDataAgent, 'create')

    const actionId = await createDeclineUseCase.execute(RFP_ID, PARTICIPANT_ID)

    expect(actionId).toBe(responseActionData.staticId)
    expect(mockActionFactory.createActionBase).toBeCalledWith(RFP_ID, ActionType.Decline, PARTICIPANT_ID, undefined)
    expect(actionCreateSpy.mock.calls[0][0]).toMatchObject(responseActionData)
    expect(mockRFPValidator.validateRFPExists).toBeCalledWith(RFP_ID)
    expect(mockRFPValidator.validateRejectNotReceivedFromParticipant).toBeCalledWith(RFP_ID, PARTICIPANT_ID)
    expect(mockRFPValidator.validateActionTypeNotSentToParticipant).toBeCalledWith(
      RFP_ID,
      ActionType.Decline,
      PARTICIPANT_ID
    )
    expect(mockRFPValidator.validateActionTypeNotSentToParticipant).toBeCalledWith(
      RFP_ID,
      ActionType.Accept,
      PARTICIPANT_ID
    )
  })

  it('throws error if action fails to save', async () => {
    mockActionFactory.createActionBase.mockReturnValue(responseActionData)
    mockActionDataAgent.create.mockRejectedValue(new Error())

    await expect(createDeclineUseCase.execute(RFP_ID, PARTICIPANT_ID)).rejects.toThrowError(SaveEntityError)
  })
})
