import { IAction, buildFakeActionExtended, ActionType } from '@komgo/types'
// tslint:disable-next-line
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { ActionFactory } from '../../actions/ActionFactory'
import InvalidActionReplyError from '../../errors/InvalidActionReplyError'
import SaveEntityError from '../../errors/SaveEntityError'
import { RFPValidator } from '../../validation/RFPValidator'

import { CreateFinancialInstitutionReplyUseCase } from './CreateFinancialInstitutionReplyUseCase'

describe('CreateFinancialInstitutionReplyUseCase', () => {
  const RFP_ID = 'rfp123'
  const RESPONSE_DATA = { data: 'mockData' }
  let responseActionData: IAction
  let requestActionData: IAction
  let mockActionDataAgent: jest.Mocked<ActionDataAgent>
  let mockActionFactory: jest.Mocked<ActionFactory>
  let mockRFPValidator: jest.Mocked<RFPValidator>
  let createFinancialInstitutionReplyUseCase: CreateFinancialInstitutionReplyUseCase

  beforeEach(() => {
    jest.resetAllMocks()
    mockActionDataAgent = createMockInstance(ActionDataAgent)
    mockActionFactory = createMockInstance(ActionFactory)
    mockRFPValidator = createMockInstance(RFPValidator)
    requestActionData = buildFakeActionExtended(ActionType.Request, true)
    responseActionData = buildFakeActionExtended(ActionType.Response, true)
    responseActionData.recipientStaticID = requestActionData.senderStaticID

    createFinancialInstitutionReplyUseCase = new CreateFinancialInstitutionReplyUseCase(
      mockActionDataAgent,
      mockActionFactory,
      mockRFPValidator
    )
  })

  it('creates the response action', async () => {
    mockRFPValidator.validateLatestActionExists.mockResolvedValue(requestActionData)
    mockActionFactory.createActionBase.mockReturnValue(responseActionData)
    mockActionDataAgent.create.mockResolvedValue(responseActionData)
    const actionCreateSpy = jest.spyOn(mockActionDataAgent, 'create')

    const actionId = await createFinancialInstitutionReplyUseCase.execute(RFP_ID, ActionType.Response, RESPONSE_DATA)

    expect(actionId).toBe(responseActionData.staticId)
    expect(mockActionFactory.createActionBase).toBeCalledWith(
      RFP_ID,
      ActionType.Response,
      requestActionData.senderStaticID,
      RESPONSE_DATA
    )
    expect(actionCreateSpy.mock.calls[0][0]).toMatchObject(responseActionData)
  })

  it('throws error if action fails to save', async () => {
    mockRFPValidator.validateLatestActionExists.mockResolvedValue(requestActionData)
    mockActionFactory.createActionBase.mockReturnValue(responseActionData)
    mockActionDataAgent.create.mockRejectedValue(new Error())

    await expect(
      createFinancialInstitutionReplyUseCase.execute(RFP_ID, ActionType.Response, RESPONSE_DATA)
    ).rejects.toThrowError(SaveEntityError)
  })

  it('throws error if RFP cant be replied', async () => {
    mockRFPValidator.validateLatestActionExists.mockResolvedValue(requestActionData)
    mockRFPValidator.validateOutboundReplyAllowed.mockRejectedValue(new InvalidActionReplyError(''))
    mockActionFactory.createActionBase.mockReturnValue(responseActionData)
    mockActionDataAgent.create.mockResolvedValue(responseActionData)

    await expect(
      createFinancialInstitutionReplyUseCase.execute(RFP_ID, ActionType.Response, RESPONSE_DATA)
    ).rejects.toThrowError(InvalidActionReplyError)
  })
})
