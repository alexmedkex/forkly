import { ErrorCode } from '@komgo/error-utilities'
import { ActionType, ActionStatus } from '@komgo/types'
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

import { ReceiveInboundAcceptUseCase } from './ReceiveInboundAcceptUseCase'

describe('ReceiveInboundAcceptUseCase', () => {
  const ACTION_TYPE = ActionType.Accept
  const BANK_ID = 'bank123'
  const TRADER_ID = 'trader123'
  let actionDataAgent: jest.Mocked<ActionDataAgent>
  let rfpValidator: jest.Mocked<RFPValidator>
  let internalMessageFactory: jest.Mocked<InternalMessageFactory>
  let internalPublisher: jest.Mocked<InternalPublisher>
  let mocks: IMocks

  let useCase: ReceiveInboundAcceptUseCase

  beforeEach(() => {
    jest.resetAllMocks()
    actionDataAgent = createMockInstance(ActionDataAgent)
    rfpValidator = createMockInstance(RFPValidator)
    internalMessageFactory = createMockInstance(InternalMessageFactory)
    internalPublisher = createMockInstance(InternalPublisher)

    useCase = new ReceiveInboundAcceptUseCase(
      actionDataAgent,
      internalPublisher,
      rfpValidator,
      internalMessageFactory,
      BANK_ID
    )
    mocks = createMocks(ActionType.Accept)
    mocks.rfpMessage.data.rfp.senderStaticID = TRADER_ID
    mocks.rfpMessage.data.rfp.recipientStaticID = BANK_ID
    mocks.action.senderStaticID = TRADER_ID
    mocks.action.recipientStaticID = BANK_ID
  })

  it(`should save an Accept Action`, async () => {
    const internalMessage = buildFakeResponseInternalMessage(buildFakeResponseInternalPayload())
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    internalMessageFactory.createReply.mockReturnValueOnce(internalMessage)

    await useCase.execute(mocks.rfpMessage, ACTION_TYPE)

    assertActionSavedAndStatusUpdated(actionDataAgent, mocks)
    expect(internalPublisher.send).toBeCalledTimes(1)
    expect(internalPublisher.send).toBeCalledWith(`INTERNAL.RFP.tradeFinance.rd.${ACTION_TYPE}`, internalMessage)

    expectCheckThatResponseExistsFromParticipant(rfpValidator, mocks.rfp.staticId, BANK_ID)
    expectCheckForRejectFromParticipant(rfpValidator, mocks.rfp.staticId, BANK_ID)
    expectCheckForAcceptDeclineFromParticipant(rfpValidator, mocks.rfp.staticId, TRADER_ID)
  })

  it(`should save an Accept Action if Action is duplicate and saved status is CREATED`, async () => {
    rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
    actionDataAgent.findOneByStaticId.mockResolvedValue(mocks.action)
    actionDataAgent.updateCreate.mockResolvedValue(mocks.action)

    await useCase.execute(mocks.rfpMessage, ACTION_TYPE)

    assertActionSavedAndStatusUpdated(actionDataAgent, mocks)
    expect(internalPublisher.send).toBeCalledTimes(1)
  })

  describe('failures', () => {
    describe('validation failures', () => {
      it(`should throw InvalidDataError if Accepted or Decline Action has been received`, async () => {
        actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
        rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)

        // mock the check for reject passing
        rfpValidator.validateActionTypesNotReceivedFromParticipant.mockResolvedValueOnce()
        // mock the check for Accept,Decline failing
        rfpValidator.validateActionTypesNotReceivedFromParticipant.mockRejectedValueOnce(new InvalidDataError(''))

        await expect(useCase.execute(mocks.rfpMessage, ACTION_TYPE)).rejects.toThrow(InvalidDataError)

        expectCheckForAcceptDeclineFromParticipant(rfpValidator, mocks.rfp.staticId, TRADER_ID)
      })

      it(`should throw InvalidDataError if a Reject has been sent`, async () => {
        actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
        rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)

        rfpValidator.validateActionTypesNotReceivedFromParticipant.mockRejectedValueOnce(new InvalidDataError(''))

        await expect(useCase.execute(mocks.rfpMessage, ACTION_TYPE)).rejects.toThrow(InvalidDataError)

        expectCheckForRejectFromParticipant(rfpValidator, mocks.rfp.staticId, BANK_ID)
      })

      it('should throw InvalidDataError if a Response Action is not found', async () => {
        actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
        rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)

        rfpValidator.validateActionTypeExistsFromParticipant.mockRejectedValueOnce(new InvalidDataError(''))
        await expect(useCase.execute(mocks.rfpMessage, ACTION_TYPE)).rejects.toThrow(InvalidDataError)
      })

      it(`should throw FailedProcessActionError if the Accept Action data is invalid`, async () => {
        rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
        actionDataAgent.updateCreate.mockRejectedValueOnce(new DatabaseError('', ErrorCode.DatabaseInvalidData))

        await expect(useCase.execute(mocks.rfpMessage, ACTION_TYPE)).rejects.toThrow(FailedProcessActionError)
      })
    })

    it(`should throw FailedProcessActionError if the Accept updateStatus fails`, async () => {
      rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
      actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
      actionDataAgent.updateStatus.mockRejectedValueOnce(new DatabaseError('', ErrorCode.DatabaseInvalidData))

      await expect(useCase.execute(mocks.rfpMessage, ACTION_TYPE)).rejects.toThrow(FailedProcessActionError)
    })

    it(`should throw same error for Accept if database fails`, async () => {
      rfpValidator.validateSenderDetails.mockResolvedValueOnce(MOCK_COMPANY_ENTRY)
      actionDataAgent.updateCreate.mockResolvedValue(mocks.action)
      actionDataAgent.updateStatus.mockRejectedValueOnce(new DatabaseError('', ErrorCode.ConnectionDatabase))

      await expect(useCase.execute(mocks.rfpMessage, ACTION_TYPE)).rejects.toThrow(DatabaseError)
    })

    it(`should throw same error if publish internal message fails for Accept`, async () => {
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

  function expectCheckForRejectFromParticipant(
    validator: jest.Mocked<RFPValidator>,
    rfpId: string,
    participantId: string
  ) {
    expect(validator.validateActionTypesNotReceivedFromParticipant.mock.calls[0]).toMatchObject([
      rfpId,
      [ActionType.Reject],
      participantId
    ])
  }

  function expectCheckThatResponseExistsFromParticipant(
    validator: jest.Mocked<RFPValidator>,
    rfpId: string,
    participantId: string
  ) {
    expect(validator.validateActionTypeExistsFromParticipant).toBeCalledWith(
      rfpId,
      ActionType.Response,
      ActionStatus.Processed,
      participantId
    )
  }

  function expectCheckForAcceptDeclineFromParticipant(
    validator: jest.Mocked<RFPValidator>,
    rfpId: string,
    participantId: string
  ) {
    expect(validator.validateActionTypesNotReceivedFromParticipant.mock.calls[1]).toMatchObject([
      rfpId,
      [ActionType.Accept, ActionType.Decline],
      participantId
    ])
  }
})
