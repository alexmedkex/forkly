import { IAction, buildFakeActionExtended, ActionType } from '@komgo/types'
// tslint:disable-next-line
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { ActionFactory } from '../../actions/ActionFactory'
import SaveEntityError from '../../errors/SaveEntityError'
import { RFPValidator } from '../../validation/RFPValidator'

import { CreateAcceptUseCase } from './CreateAcceptUseCase'

describe('CreateAcceptUseCase', () => {
  const RFP_ID = 'rfp123'
  const RESPONSE_DATA = { data: 'mockData' }
  const PARTICIPANT_ID = 'part123'
  let responseActionData: IAction
  let requestActionData: IAction
  let mockActionDataAgent: jest.Mocked<ActionDataAgent>
  let mockActionFactory: jest.Mocked<ActionFactory>
  let mockRFPValidator: jest.Mocked<RFPValidator>
  let createAcceptUseCase: CreateAcceptUseCase

  beforeEach(() => {
    jest.resetAllMocks()
    mockActionDataAgent = createMockInstance(ActionDataAgent)
    mockActionFactory = createMockInstance(ActionFactory)
    mockRFPValidator = createMockInstance(RFPValidator)
    requestActionData = buildFakeActionExtended(ActionType.Request, true)
    responseActionData = buildFakeActionExtended(ActionType.Response, true)
    responseActionData.recipientStaticID = requestActionData.senderStaticID

    createAcceptUseCase = new CreateAcceptUseCase(mockActionDataAgent, mockActionFactory, mockRFPValidator)
  })

  it('creates the accept action', async () => {
    mockActionFactory.createActionBase.mockReturnValue(responseActionData)
    mockActionDataAgent.create.mockResolvedValue(responseActionData)
    const actionCreateSpy = jest.spyOn(mockActionDataAgent, 'create')

    const actionId = await createAcceptUseCase.execute(RFP_ID, RESPONSE_DATA, PARTICIPANT_ID)

    expect(actionId).toBe(responseActionData.staticId)
    expect(mockActionFactory.createActionBase).toBeCalledWith(RFP_ID, ActionType.Accept, PARTICIPANT_ID, RESPONSE_DATA)
    expect(actionCreateSpy.mock.calls[0][0]).toMatchObject(responseActionData)
    expect(mockRFPValidator.validateOutboundAcceptAllowed).toBeCalledWith(RFP_ID, PARTICIPANT_ID)
  })

  it('throws error if action fails to save', async () => {
    mockActionFactory.createActionBase.mockReturnValue(responseActionData)
    mockActionDataAgent.create.mockRejectedValue(new Error())

    await expect(createAcceptUseCase.execute(RFP_ID, RESPONSE_DATA, PARTICIPANT_ID)).rejects.toThrowError(
      SaveEntityError
    )
  })
})
