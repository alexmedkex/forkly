import { ErrorCode } from '@komgo/error-utilities'
import { ActionType } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { MOCK_COMPANY_ENTRY } from '../../../../integration-tests/utils/mock-data'
import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import DatabaseError from '../../../data-layer/data-agents/DatabaseError'
import { RequestForProposalDataAgent } from '../../../data-layer/data-agents/RequestForProposalDataAgent'
import FailedProcessActionError from '../../errors/FailedProcessActionError'
import { buildFakeRequestInternalMessage, buildFakeRequestInternalPayload } from '../../messaging/faker'
import InternalMessageFactory from '../../messaging/InternalMessageFactory'
import InternalPublisher from '../../messaging/InternalPublisher'
import { RFPValidator } from '../../validation/RFPValidator'
import { createMocks, IMocks, assertActionSavedAndStatusUpdated } from '../InboundUseCaseTestUtils'

import ReceiveInboundRequestUseCase from './ReceiveInboundRequestUseCase'

describe('ReceiveInboundRequestUseCase', () => {
  let useCase: ReceiveInboundRequestUseCase

  let actionDataAgent: jest.Mocked<ActionDataAgent>
  let requestForProposalDataAgent: jest.Mocked<RequestForProposalDataAgent>
  let rfpValidator: jest.Mocked<RFPValidator>
  let internalMessageFactory: jest.Mocked<InternalMessageFactory>
  let internalPublisher: jest.Mocked<InternalPublisher>

  let mocks: IMocks

  beforeEach(() => {
    actionDataAgent = createMockInstance(ActionDataAgent)
    requestForProposalDataAgent = createMockInstance(RequestForProposalDataAgent)
    rfpValidator = createMockInstance(RFPValidator)
    internalMessageFactory = createMockInstance(InternalMessageFactory)
    internalPublisher = createMockInstance(InternalPublisher)

    useCase = new ReceiveInboundRequestUseCase(
      actionDataAgent,
      internalPublisher,
      rfpValidator,
      internalMessageFactory,
      requestForProposalDataAgent
    )
    mocks = createMocks(ActionType.Request)
  })

  it('should save RFP & Action', async () => {
    const internalMessage = buildFakeRequestInternalMessage(buildFakeRequestInternalPayload())
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    requestForProposalDataAgent.updateCreate.mockResolvedValue(mocks.rfp)
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    internalMessageFactory.createRequest.mockReturnValueOnce(internalMessage)

    await useCase.execute(mocks.rfpMessage, ActionType.Request)

    assertActionSavedAndStatusUpdated(actionDataAgent, mocks)
    expect(requestForProposalDataAgent.updateCreate).toBeCalledTimes(1)
    expect(requestForProposalDataAgent.updateCreate).toBeCalledWith(expect.objectContaining(mocks.rfp))
    expect(internalPublisher.send).toBeCalledTimes(1)
    expect(internalPublisher.send).toBeCalledWith(`INTERNAL.RFP.tradeFinance.rd.Request`, internalMessage)
  })

  it('should save RFP and action if action is duplicate and saved status is CREATED', async () => {
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    actionDataAgent.findOneByStaticId.mockResolvedValue(mocks.action)
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    requestForProposalDataAgent.updateCreate.mockResolvedValue(mocks.rfp)

    await useCase.execute(mocks.rfpMessage, ActionType.Request)

    assertActionSavedAndStatusUpdated(actionDataAgent, mocks)
    expect(requestForProposalDataAgent.updateCreate).toBeCalledTimes(1)
    expect(requestForProposalDataAgent.updateCreate).toBeCalledWith(expect.objectContaining(mocks.rfp))
    expect(internalPublisher.send).toBeCalledTimes(1)
  })

  it('should throw FailedProcessActionError if the Action data is invalid', async () => {
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    actionDataAgent.updateCreate.mockRejectedValueOnce(new DatabaseError('', ErrorCode.DatabaseInvalidData))

    await expect(useCase.execute(mocks.rfpMessage, ActionType.Request)).rejects.toThrow(FailedProcessActionError)
  })

  it('should throw FailedProcessActionError if the updateStatus', async () => {
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    actionDataAgent.updateStatus.mockRejectedValueOnce(new DatabaseError('', ErrorCode.DatabaseInvalidData))

    await expect(useCase.execute(mocks.rfpMessage, ActionType.Request)).rejects.toThrow(FailedProcessActionError)
  })

  it('should throw same error if database fails', async () => {
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    actionDataAgent.updateStatus.mockRejectedValueOnce(new DatabaseError('', ErrorCode.ConnectionDatabase))

    await expect(useCase.execute(mocks.rfpMessage, ActionType.Request)).rejects.toThrow(DatabaseError)
  })

  it('should throw same error if publish internal message fails', async () => {
    const internalMessage = buildFakeRequestInternalMessage(buildFakeRequestInternalPayload())
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    requestForProposalDataAgent.updateCreate.mockResolvedValue(mocks.rfp)
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    internalMessageFactory.createRequest.mockReturnValueOnce(internalMessage)
    internalPublisher.send.mockRejectedValueOnce(new Error())

    await expect(useCase.execute(mocks.rfpMessage, ActionType.Request)).rejects.toThrow(Error)
    expect(actionDataAgent.updateCreate).toBeCalledTimes(1)
    expect(requestForProposalDataAgent.updateCreate).toBeCalledTimes(1)
    expect(internalPublisher.send).toBeCalledTimes(1)
  })
})
