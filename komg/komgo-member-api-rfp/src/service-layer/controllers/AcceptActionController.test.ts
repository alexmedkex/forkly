import { ErrorCode } from '@komgo/error-utilities'
import { ActionType, IOutboundActionResult, ActionStatus, IRFPAcceptResponse } from '@komgo/types'
// tslint:disable-next-line
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import FailedProcessReplyActionError from '../../business-layer/errors/FailedProcessReplyActionError'
import InvalidActionReplyError from '../../business-layer/errors/InvalidActionReplyError'
import MissingRequiredData from '../../business-layer/errors/MissingRequiredData'
import RFPNotFoundError from '../../business-layer/errors/RFPNotFoundError'
import { AutoDeclineUseCase } from '../../business-layer/outbound-actions/corporate/AutoDeclineUseCase'
import { CreateAcceptUseCase } from '../../business-layer/outbound-actions/corporate/CreateAcceptUseCase'
import SendOutboundReplyUseCase from '../../business-layer/outbound-actions/SendOutboundReplyUseCase'
import CreateRFPAcceptRequest from '../requests/CreateRFPAcceptRequest'

import { AcceptActionController } from './AcceptActionController'

describe('AcceptActionController', () => {
  let acceptActionController: AcceptActionController
  const PARTICIPANT_ID = 'company123'
  const RFP_ID = 'rfp123'
  const ACTION_ID = 'action123'
  const mockAcceptedActionStatus: IOutboundActionResult = {
    status: ActionStatus.Processed,
    recipientStaticId: PARTICIPANT_ID
  }
  const mockDeclinedActionStatus: IOutboundActionResult = {
    status: ActionStatus.Processed,
    recipientStaticId: PARTICIPANT_ID
  }
  const mockRFPAcceptRequest: CreateRFPAcceptRequest = {
    responseData: { data: 'mockData' },
    participantStaticId: PARTICIPANT_ID
  }
  let mockCreateAcceptUseCase: jest.Mocked<CreateAcceptUseCase>
  let mockSendOutboundReplyUseCase: jest.Mocked<SendOutboundReplyUseCase>
  let mockAutoDeclineUseCase: jest.Mocked<AutoDeclineUseCase>

  beforeEach(() => {
    mockCreateAcceptUseCase = createMockInstance(CreateAcceptUseCase)
    mockSendOutboundReplyUseCase = createMockInstance(SendOutboundReplyUseCase)
    mockAutoDeclineUseCase = createMockInstance(AutoDeclineUseCase)
    acceptActionController = new AcceptActionController(
      mockCreateAcceptUseCase,
      mockAutoDeclineUseCase,
      mockSendOutboundReplyUseCase
    )
  })

  it('succeeds and returns the status of the action being sent', async () => {
    const expectedResult: IRFPAcceptResponse = {
      rfpId: RFP_ID,
      actionStatuses: [mockAcceptedActionStatus, mockDeclinedActionStatus]
    }
    mockCreateAcceptUseCase.execute.mockResolvedValueOnce(ACTION_ID)
    mockSendOutboundReplyUseCase.execute.mockResolvedValueOnce(mockAcceptedActionStatus)
    mockAutoDeclineUseCase.execute.mockResolvedValueOnce([mockDeclinedActionStatus])

    const result = await acceptActionController.create(RFP_ID, mockRFPAcceptRequest)

    expect(mockCreateAcceptUseCase.execute).toBeCalledWith(RFP_ID, mockRFPAcceptRequest.responseData, PARTICIPANT_ID)
    expect(mockSendOutboundReplyUseCase.execute).toBeCalledWith(RFP_ID, ActionType.Accept)
    expect(mockAutoDeclineUseCase.execute).toBeCalledWith(RFP_ID)
    expect(result).toMatchObject(expectedResult)
  })

  it('fails and throws an internal server execption if it fails to create RFP Request', async () => {
    mockCreateAcceptUseCase.execute.mockRejectedValueOnce(new Error())

    await failWithStatusAndErrorCode(ErrorCode.UnexpectedError, 500)
  })

  it('fails and throws an 404 not found if RFP not found', async () => {
    mockCreateAcceptUseCase.execute.mockRejectedValueOnce(new RFPNotFoundError(''))

    await failWithStatusAndErrorCode(ErrorCode.ValidationHttpContent, 404)
  })

  it('fails and throws an 500 for missing data', async () => {
    mockCreateAcceptUseCase.execute.mockRejectedValueOnce(new MissingRequiredData())

    await failWithStatusAndErrorCode(ErrorCode.DatabaseMissingData, 500)
  })

  it('fails and throws an 500 for failed rabbitMQ connection', async () => {
    mockSendOutboundReplyUseCase.execute.mockRejectedValueOnce(new FailedProcessReplyActionError())

    await failWithStatusAndErrorCode(ErrorCode.ConnectionInternalMQ, 500)
  })

  it('fails and throws an conflict exception if the reply action is invalid', async () => {
    mockCreateAcceptUseCase.execute.mockRejectedValueOnce(new InvalidActionReplyError('Error'))

    await failWithStatusAndErrorCode(ErrorCode.ValidationHttpContent, 409)
  })

  async function failWithStatusAndErrorCode(errorCode: ErrorCode, status: number) {
    try {
      await acceptActionController.create(RFP_ID, mockRFPAcceptRequest)
      fail('Should have thrown error')
    } catch (error) {
      expect(error.errorObject.errorCode).toBe(errorCode)
      expect(error.status).toBe(status)
    }
  }
})
