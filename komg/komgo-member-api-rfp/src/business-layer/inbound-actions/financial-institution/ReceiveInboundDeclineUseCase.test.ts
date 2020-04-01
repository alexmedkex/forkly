import { ErrorCode } from '@komgo/error-utilities'
import { ActionType, buildFakeActionExtended } from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { MOCK_COMPANY_ENTRY } from '../../../../integration-tests/utils/mock-data'
import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import DatabaseError from '../../../data-layer/data-agents/DatabaseError'
import FailedProcessActionError from '../../errors/FailedProcessActionError'
import InvalidDataError from '../../errors/InvalidDataError'
import { buildFakeResponseInternalMessage, buildFakeResponseInternalPayload } from '../../messaging/faker'
import InternalMessageFactory from '../../messaging/InternalMessageFactory'
import InternalPublisher from '../../messaging/InternalPublisher'
import { RFPValidator } from '../../validation/RFPValidator'
import { createMocks, IMocks, assertActionSavedAndStatusUpdated } from '../InboundUseCaseTestUtils'

import { ReceiveInboundDeclineUseCase } from './ReceiveInboundDeclineUseCase'

describe('ReceiveInboundDeclineUseCase', () => {
  const COMPANY_STATIC_ID = '123'
  const DECLINE_ACTION_TYPE = ActionType.Decline
  const BANK_ID = 'bank123'
  const TRADER_ID = 'trader123'
  let actionDataAgent: jest.Mocked<ActionDataAgent>
  let rfpValidator: jest.Mocked<RFPValidator>
  let internalMessageFactory: jest.Mocked<InternalMessageFactory>
  let internalPublisher: jest.Mocked<InternalPublisher>
  let mocks: IMocks

  let useCase: ReceiveInboundDeclineUseCase

  beforeEach(() => {
    jest.resetAllMocks()
    actionDataAgent = createMockInstance(ActionDataAgent)
    rfpValidator = createMockInstance(RFPValidator)
    internalMessageFactory = createMockInstance(InternalMessageFactory)
    internalPublisher = createMockInstance(InternalPublisher)

    useCase = new ReceiveInboundDeclineUseCase(
      actionDataAgent,
      internalPublisher,
      rfpValidator,
      internalMessageFactory,
      COMPANY_STATIC_ID
    )
    mocks = createMocks(DECLINE_ACTION_TYPE)
    mocks.rfpMessage.data.rfp.senderStaticID = TRADER_ID
    mocks.rfpMessage.data.rfp.recipientStaticID = BANK_ID
    mocks.action.senderStaticID = TRADER_ID
    mocks.action.recipientStaticID = BANK_ID
  })

  it(`should save a Decline Action if bank has sent a response`, async () => {
    const internalMessage = buildFakeResponseInternalMessage(buildFakeResponseInternalPayload())
    const responseAction = buildFakeActionExtended(ActionType.Response, true)
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    internalMessageFactory.createReply.mockReturnValueOnce(internalMessage)
    actionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValueOnce(responseAction)

    await useCase.execute(mocks.rfpMessage, DECLINE_ACTION_TYPE)

    assertActionSavedAndStatusUpdated(actionDataAgent, mocks)
    expect(internalPublisher.send).toBeCalledTimes(1)
    expect(internalPublisher.send).toBeCalledWith(
      `INTERNAL.RFP.tradeFinance.rd.${DECLINE_ACTION_TYPE}`,
      internalMessage
    )

    expect(rfpValidator.validateRFPExists).toBeCalledWith(mocks.rfp.staticId)
    expectCheckRejectNotSentToParticipant(rfpValidator, mocks.rfp.staticId, TRADER_ID)
    expectCheckDeclineOrAcceptNotReceivedFromParticipant(rfpValidator, mocks.rfp.staticId, TRADER_ID)
    expect(rfpValidator.validateActionStatus).toBeCalledWith(mocks.rfpMessage.data.rfp.actionId)
  })

  it(`should save a Decline Action if bank has not sent a response`, async () => {
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    actionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValueOnce(null)

    await useCase.execute(mocks.rfpMessage, DECLINE_ACTION_TYPE)

    assertActionSavedAndStatusUpdated(actionDataAgent, mocks)
  })

  it(`should save an Decline Action if Action is duplicate and saved status is CREATED`, async () => {
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    actionDataAgent.findOneByStaticId.mockResolvedValue(mocks.action)
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)

    await useCase.execute(mocks.rfpMessage, DECLINE_ACTION_TYPE)

    assertActionSavedAndStatusUpdated(actionDataAgent, mocks)
    expect(internalPublisher.send).toBeCalledTimes(1)
  })

  describe('failures', () => {
    describe('validation failures', () => {
      it(`should throw InvalidDataError if Accepted or Decline Action has been received`, async () => {
        actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
        rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)

        rfpValidator.validateActionTypesNotReceivedFromParticipant.mockRejectedValueOnce(new InvalidDataError(''))

        await expect(useCase.execute(mocks.rfpMessage, DECLINE_ACTION_TYPE)).rejects.toThrow(InvalidDataError)
      })

      it(`should throw InvalidDataError if a Reject has been sent`, async () => {
        actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
        rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)

        // mock the check for sent reject failing
        rfpValidator.validateActionTypeNotSentToParticipant.mockRejectedValueOnce(new InvalidDataError(''))

        await expect(useCase.execute(mocks.rfpMessage, DECLINE_ACTION_TYPE)).rejects.toThrow(InvalidDataError)
      })

      it(`should throw FailedProcessActionError if the Decline Action data is invalid`, async () => {
        rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
        actionDataAgent.updateCreate.mockRejectedValueOnce(new DatabaseError('', ErrorCode.DatabaseInvalidData))

        await expect(useCase.execute(mocks.rfpMessage, DECLINE_ACTION_TYPE)).rejects.toThrow(FailedProcessActionError)
      })
    })

    it(`should throw FailedProcessActionError if the Decline updateStatus fails`, async () => {
      rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
      actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
      actionDataAgent.updateStatus.mockRejectedValueOnce(new DatabaseError('', ErrorCode.DatabaseInvalidData))

      await expect(useCase.execute(mocks.rfpMessage, DECLINE_ACTION_TYPE)).rejects.toThrow(FailedProcessActionError)
    })

    it(`should throw same error for Decline if database fails`, async () => {
      rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
      actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
      actionDataAgent.updateStatus.mockRejectedValueOnce(new DatabaseError('', ErrorCode.ConnectionDatabase))

      await expect(useCase.execute(mocks.rfpMessage, DECLINE_ACTION_TYPE)).rejects.toThrow(DatabaseError)
    })

    it(`should throw same error if publish internal message fails for Decline`, async () => {
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

  function expectCheckDeclineOrAcceptNotReceivedFromParticipant(
    validator: jest.Mocked<RFPValidator>,
    rfpId: string,
    participantId: string
  ) {
    expect(validator.validateActionTypesNotReceivedFromParticipant).toBeCalledWith(
      rfpId,
      [ActionType.Decline, ActionType.Accept],
      participantId
    )
  }

  function expectCheckRejectNotSentToParticipant(
    validator: jest.Mocked<RFPValidator>,
    rfpId: string,
    participantId: string
  ) {
    expect(validator.validateActionTypeNotSentToParticipant).toBeCalledWith(rfpId, ActionType.Reject, participantId)
  }
})
