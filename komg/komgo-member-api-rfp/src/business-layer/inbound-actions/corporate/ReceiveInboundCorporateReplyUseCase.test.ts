import { ErrorCode } from '@komgo/error-utilities'
import { ActionType } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { MOCK_COMPANY_ENTRY } from '../../../../integration-tests/utils/mock-data'
import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import DatabaseError from '../../../data-layer/data-agents/DatabaseError'
import FailedProcessActionError from '../../errors/FailedProcessActionError'
import { buildFakeResponseInternalMessage, buildFakeResponseInternalPayload } from '../../messaging/faker'
import InternalMessageFactory from '../../messaging/InternalMessageFactory'
import InternalPublisher from '../../messaging/InternalPublisher'
import { RFPValidator } from '../../validation/RFPValidator'
import { IMocks, createMocks, assertActionSavedAndStatusUpdated } from '../InboundUseCaseTestUtils'

import ReceiveInboundCorporateReplyUseCase from './ReceiveInboundCorporateReplyUseCase'

describe.each([ActionType.Response, ActionType.Reject])('ReceiveInboundCorporateReplyUseCase', actionType => {
  let actionDataAgent: jest.Mocked<ActionDataAgent>
  let rfpValidator: jest.Mocked<RFPValidator>
  let internalMessageFactory: jest.Mocked<InternalMessageFactory>
  let internalPublisher: jest.Mocked<InternalPublisher>
  let mocks: IMocks

  let useCase: ReceiveInboundCorporateReplyUseCase

  beforeEach(() => {
    actionDataAgent = createMockInstance(ActionDataAgent)
    rfpValidator = createMockInstance(RFPValidator)
    internalMessageFactory = createMockInstance(InternalMessageFactory)
    internalPublisher = createMockInstance(InternalPublisher)

    useCase = new ReceiveInboundCorporateReplyUseCase(
      actionDataAgent,
      internalPublisher,
      rfpValidator,
      internalMessageFactory
    )
    mocks = createMocks(actionType)
  })

  it(`should save a ${actionType} Action`, async () => {
    const internalMessage = buildFakeResponseInternalMessage(buildFakeResponseInternalPayload())
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    internalMessageFactory.createReply.mockReturnValueOnce(internalMessage)

    await useCase.execute(mocks.rfpMessage, actionType)

    assertActionSavedAndStatusUpdated(actionDataAgent, mocks)
    expect(internalPublisher.send).toBeCalledTimes(1)
    expect(internalPublisher.send).toBeCalledWith(`INTERNAL.RFP.tradeFinance.rd.${actionType}`, internalMessage)
  })

  it(`should save a ${actionType}  Action if Action is duplicate and saved status is CREATED`, async () => {
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    actionDataAgent.findOneByStaticId.mockResolvedValue(mocks.action)
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)

    await useCase.execute(mocks.rfpMessage, actionType)

    assertActionSavedAndStatusUpdated(actionDataAgent, mocks)
    expect(internalPublisher.send).toBeCalledTimes(1)
  })

  it(`should throw FailedProcessActionError if the ${actionType} Action data is invalid`, async () => {
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    actionDataAgent.updateCreate.mockRejectedValueOnce(new DatabaseError('', ErrorCode.DatabaseInvalidData))

    await expect(useCase.execute(mocks.rfpMessage, actionType)).rejects.toThrow(FailedProcessActionError)
  })

  it(`should throw FailedProcessActionError if the ${actionType} updateStatus`, async () => {
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    actionDataAgent.updateStatus.mockRejectedValueOnce(new DatabaseError('', ErrorCode.DatabaseInvalidData))

    await expect(useCase.execute(mocks.rfpMessage, actionType)).rejects.toThrow(FailedProcessActionError)
  })

  it(`should throw same error for ${actionType} if database fails`, async () => {
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    actionDataAgent.updateStatus.mockRejectedValueOnce(new DatabaseError('', ErrorCode.ConnectionDatabase))

    await expect(useCase.execute(mocks.rfpMessage, actionType)).rejects.toThrow(DatabaseError)
  })

  it(`should throw same error if publish internal message fails for ${actionType}`, async () => {
    const internalMessage = buildFakeResponseInternalMessage(buildFakeResponseInternalPayload())
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    internalMessageFactory.createReply.mockReturnValueOnce(internalMessage)
    internalPublisher.send.mockRejectedValueOnce(new Error())

    await expect(useCase.execute(mocks.rfpMessage, ActionType.Request)).rejects.toThrow(Error)

    expect(actionDataAgent.updateCreate).toBeCalledTimes(1)
    expect(internalPublisher.send).toBeCalledTimes(1)
  })
})
