import {
  buildFakeRequestForProposalExtended,
  buildFakeActionExtended,
  ActionType,
  ActionStatus,
  IAction
} from '@komgo/types'
// tslint:disable-next-line
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { MOCK_COMPANY_ENTRY } from '../../../integration-tests/utils/mock-data'
import { ActionDataAgent } from '../../data-layer/data-agents/ActionDataAgent'
import { RequestForProposalDataAgent } from '../../data-layer/data-agents/RequestForProposalDataAgent'
import CompanyRegistryClient from '../company-registry/CompanyRegistryClient'
import InvalidActionReplyError from '../errors/InvalidActionReplyError'
import InvalidDataError from '../errors/InvalidDataError'
import MissingRequiredData from '../errors/MissingRequiredData'
import RFPNotFoundError from '../errors/RFPNotFoundError'

import { RFPValidator } from './RFPValidator'

describe('RFPValidator', () => {
  const RFP_ID = 'rfp123'
  const COMPANY_STATIC_ID = 'companyId123'
  const OTHER_PARTY_STATIC_ID = 'other123'
  let mockRFPDataAgent: jest.Mocked<RequestForProposalDataAgent>
  let mockActionDataAgent: jest.Mocked<ActionDataAgent>
  let mockCompanyClient: jest.Mocked<CompanyRegistryClient>
  let rfpValidator: RFPValidator

  beforeEach(() => {
    jest.resetAllMocks()
    mockRFPDataAgent = createMockInstance(RequestForProposalDataAgent)
    mockActionDataAgent = createMockInstance(ActionDataAgent)
    mockCompanyClient = createMockInstance(CompanyRegistryClient)
    rfpValidator = new RFPValidator(mockRFPDataAgent, mockActionDataAgent, mockCompanyClient, COMPANY_STATIC_ID)
  })

  it('validates and returns an RFP', async () => {
    const mockRfp = buildFakeRequestForProposalExtended(true)
    mockRFPDataAgent.findOneByStaticId.mockResolvedValue(mockRfp)

    const rfp = await rfpValidator.validateRFPExists(RFP_ID)
    expect(rfp).toBe(mockRfp)
  })

  it('throws error if rfp not found', async () => {
    mockActionDataAgent.findByRFPIdAndActionType.mockResolvedValue(null)

    expect(rfpValidator.validateRFPExists(RFP_ID)).rejects.toThrowError(RFPNotFoundError)
  })

  it('validates and returns the latest Action', async () => {
    const mockAction = buildFakeActionExtended(ActionType.Response)
    mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValue(mockAction)

    const action = await rfpValidator.validateLatestActionExists(RFP_ID, ActionType.Request, ActionStatus.Created)
    expect(action).toBe(mockAction)
    expect(mockActionDataAgent.findLatestByRFPIdAndActionType).toBeCalledWith(
      RFP_ID,
      ActionType.Request,
      ActionStatus.Created
    )
  })

  it('throws error if action not found', async () => {
    mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValue(null)

    expect(
      rfpValidator.validateLatestActionExists(RFP_ID, ActionType.Request, ActionStatus.Created)
    ).rejects.toThrowError(MissingRequiredData)
  })

  it('should throw InvalidDataError if action is duplicate and saved status is FAILED', async () => {
    const action = buildFakeActionExtended(ActionType.Request)
    action.status = ActionStatus.Failed
    mockActionDataAgent.findOneByStaticId.mockResolvedValue(action)

    await expect(rfpValidator.validateActionStatus(action.staticId)).rejects.toThrow(InvalidDataError)
  })

  it('should throw InvalidDataError if action is duplicate and saved status is PROCESS', async () => {
    const action = buildFakeActionExtended(ActionType.Request)
    action.status = ActionStatus.Processed
    mockActionDataAgent.findOneByStaticId.mockResolvedValue(action)

    await expect(rfpValidator.validateActionStatus(action.staticId)).rejects.toThrow(InvalidDataError)
  })

  it('validates sender details', async () => {
    mockCompanyClient.getEntryFromStaticId.mockResolvedValue(MOCK_COMPANY_ENTRY)

    const senderDetails = await rfpValidator.validateSenderDetails('senderId')
    expect(senderDetails).toBe(MOCK_COMPANY_ENTRY)
  })

  it('throws InvalidDataError if it cannot get sender details', async () => {
    mockCompanyClient.getEntryFromStaticId.mockResolvedValue(null)

    await expect(rfpValidator.validateSenderDetails('senderId')).rejects.toThrowError(InvalidDataError)
  })

  describe('validateActionTypeNotSentToParticipant', () => {
    it('validates that action type has not been sent to a participant', async () => {
      rfpValidator.validateActionTypeNotSentToParticipant(RFP_ID, ActionType.Accept, OTHER_PARTY_STATIC_ID)

      expect(mockActionDataAgent.findLatestByRFPIdAndActionType).toBeCalledWith(
        RFP_ID,
        ActionType.Accept,
        ActionStatus.Processed,
        COMPANY_STATIC_ID,
        OTHER_PARTY_STATIC_ID
      )
    })

    it('fails validation if action type has been sent to participant', async () => {
      const foundAction = buildFakeActionExtended(ActionType.Accept)
      mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValue(foundAction)

      await expect(
        rfpValidator.validateActionTypeNotSentToParticipant(RFP_ID, ActionType.Accept, OTHER_PARTY_STATIC_ID)
      ).rejects.toThrowError(InvalidActionReplyError)
    })
  })

  describe('validateActionTypesNotFoundFromParticipant', () => {
    it('validates that action types do not exist for a participant', async () => {
      rfpValidator.validateActionTypesNotReceivedFromParticipant(RFP_ID, [ActionType.Accept], OTHER_PARTY_STATIC_ID)

      expect(mockActionDataAgent.findActionsByRFPIdAndActionTypes).toBeCalledWith(
        RFP_ID,
        [ActionType.Accept],
        ActionStatus.Processed,
        OTHER_PARTY_STATIC_ID
      )
    })
    it('fails validation if action types are found for a participant', async () => {
      const foundAction = buildFakeActionExtended(ActionType.Accept)
      mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValue([foundAction])

      await expect(
        rfpValidator.validateActionTypesNotReceivedFromParticipant(RFP_ID, [ActionType.Accept], OTHER_PARTY_STATIC_ID)
      ).rejects.toThrowError(InvalidActionReplyError)
    })
  })

  describe('validateActionTypeExistsFromParticipant', () => {
    it('validates that an action type exists from a participant', async () => {
      rfpValidator.validateActionTypeExistsFromParticipant(
        RFP_ID,
        ActionType.Response,
        ActionStatus.Processed,
        OTHER_PARTY_STATIC_ID
      )

      expect(mockActionDataAgent.findLatestByRFPIdAndActionType).toBeCalledWith(
        RFP_ID,
        ActionType.Response,
        ActionStatus.Processed,
        OTHER_PARTY_STATIC_ID
      )
    })

    it('fails validation if action types are not found for a participant', async () => {
      const foundAction = buildFakeActionExtended(ActionType.Accept)
      mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValue(null)

      await expect(
        rfpValidator.validateActionTypeExistsFromParticipant(
          RFP_ID,
          ActionType.Response,
          ActionStatus.Processed,
          OTHER_PARTY_STATIC_ID
        )
      ).rejects.toThrowError(InvalidActionReplyError)
    })
  })

  describe('validateOutboundAcceptAllowed', () => {
    let responseAction: IAction

    beforeEach(() => {
      responseAction = buildFakeActionExtended(ActionType.Response)
    })

    it('should validate that sending an Accept is allowed', async () => {
      mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValueOnce(responseAction)
      mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValueOnce(null)
      mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValueOnce(null)
      mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValueOnce(null)
      mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValue([])

      await rfpValidator.validateOutboundAcceptAllowed(RFP_ID, OTHER_PARTY_STATIC_ID)

      expectCheckForRejectFromParticipant(mockActionDataAgent, RFP_ID, OTHER_PARTY_STATIC_ID)
      expectCheckForAcceptFromParticipant(mockActionDataAgent, RFP_ID, COMPANY_STATIC_ID)
    })

    it(`should throw InvalidDataError if an Accepted Action has been sent`, async () => {
      const action = buildFakeActionExtended(ActionType.Accept)
      mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValueOnce(responseAction)
      mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValueOnce(null)
      mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValueOnce(null)
      mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValue([action])

      await expect(rfpValidator.validateOutboundAcceptAllowed(RFP_ID, OTHER_PARTY_STATIC_ID)).rejects.toThrow(
        InvalidActionReplyError
      )
      expectCheckForRejectFromParticipant(mockActionDataAgent, RFP_ID, OTHER_PARTY_STATIC_ID)
      expectCheckForAcceptFromParticipant(mockActionDataAgent, RFP_ID, COMPANY_STATIC_ID)
    })

    it(`should throw InvalidDataError if a Declined Action has been sent to the participant`, async () => {
      const action = buildFakeActionExtended(ActionType.Decline)
      mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValueOnce(responseAction)
      mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValueOnce(null)
      mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValueOnce(action)
      mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValueOnce(null)
      mockActionDataAgent.findActionsByRFPIdAndActionTypes.mockResolvedValue([action])

      await expect(rfpValidator.validateOutboundAcceptAllowed(RFP_ID, OTHER_PARTY_STATIC_ID)).rejects.toThrow(
        InvalidActionReplyError
      )
      expectCheckForRejectFromParticipant(mockActionDataAgent, RFP_ID, OTHER_PARTY_STATIC_ID)
      expectCheckForDeclineToRceipient(mockActionDataAgent, RFP_ID, COMPANY_STATIC_ID, OTHER_PARTY_STATIC_ID)
    })

    it('should throw InvalidDataError if a Response Action is not found', async () => {
      mockActionDataAgent.findLatestByRFPIdAndActionType.mockResolvedValueOnce(null)

      await expect(rfpValidator.validateOutboundAcceptAllowed(RFP_ID, OTHER_PARTY_STATIC_ID)).rejects.toThrow(
        InvalidActionReplyError
      )
    })
  })
})

function expectCheckForDeclineToRceipient(
  mockActionDataAgent: jest.Mocked<ActionDataAgent>,
  rfpId: string,
  senderId: string,
  receipientId: string
) {
  expect(mockActionDataAgent.findLatestByRFPIdAndActionType).toBeCalledWith(
    rfpId,
    ActionType.Decline,
    ActionStatus.Processed,
    senderId,
    receipientId
  )
}

function expectCheckForAcceptFromParticipant(
  mockActionDataAgent: jest.Mocked<ActionDataAgent>,
  rfpId: string,
  participantId: string
) {
  expect(mockActionDataAgent.findActionsByRFPIdAndActionTypes).toBeCalledWith(
    rfpId,
    [ActionType.Accept],
    ActionStatus.Processed,
    participantId
  )
}

function expectCheckForRejectFromParticipant(
  mockActionDataAgent: jest.Mocked<ActionDataAgent>,
  rfpId: string,
  participantId: string
) {
  expect(mockActionDataAgent.findActionsByRFPIdAndActionTypes.mock.calls[0]).toMatchObject([
    rfpId,
    [ActionType.Reject],
    ActionStatus.Processed,
    participantId
  ])
}
