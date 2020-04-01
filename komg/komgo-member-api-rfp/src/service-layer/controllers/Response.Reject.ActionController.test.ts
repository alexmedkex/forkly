import { ErrorCode } from '@komgo/error-utilities'
import { ActionType, IOutboundActionResult, ActionStatus, IRFPReplyResponse } from '@komgo/types'
// tslint:disable-next-line
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import FailedProcessReplyActionError from '../../business-layer/errors/FailedProcessReplyActionError'
import InvalidActionReplyError from '../../business-layer/errors/InvalidActionReplyError'
import MissingRequiredData from '../../business-layer/errors/MissingRequiredData'
import RFPNotFoundError from '../../business-layer/errors/RFPNotFoundError'
import { ReplyUseCase } from '../../business-layer/outbound-actions/finanical-institution/ReplyUseCase'
import CreateRFPReplyRequest from '../requests/CreateRFPReplyRequest'

import { RejectActionController } from './RejectActionController'
import { ResponseActionController } from './ResponseActionController'

describe.each([ActionType.Response, ActionType.Reject])(
  'ActionControllers doing Response or Reject',
  (actionType: ActionType) => {
    let mockReplyUseCase: jest.Mocked<ReplyUseCase>
    let replyActionController: ResponseActionController | RejectActionController

    const RFP_ID = 'rfp123'
    const mockActionStatus: IOutboundActionResult = { status: ActionStatus.Processed, recipientStaticId: '123' }
    const mockRFPResponse: CreateRFPReplyRequest = { responseData: { data: 'mockData' } }

    beforeEach(() => {
      mockReplyUseCase = createMockInstance(ReplyUseCase)

      if (actionType === ActionType.Response) {
        replyActionController = new ResponseActionController(mockReplyUseCase)
      } else if (actionType === ActionType.Reject) {
        replyActionController = new RejectActionController(mockReplyUseCase)
      }
    })

    it('succeeds and returns the static Id of the RFP', async () => {
      const expectedResult: IRFPReplyResponse = { rfpId: RFP_ID, actionStatus: mockActionStatus }
      mockReplyUseCase.execute.mockResolvedValueOnce(expectedResult)

      const result = await replyActionController.create(RFP_ID, mockRFPResponse)

      expect(result).toMatchObject(expectedResult)
      expect(mockReplyUseCase.execute).toBeCalledWith(RFP_ID, actionType, mockRFPResponse.responseData)
    })

    it('fails and throws an internal server execption if it fails to create RFP Request', async () => {
      mockReplyUseCase.execute.mockRejectedValueOnce(new Error())

      await failWithStatusAndErrorCode(ErrorCode.UnexpectedError, 500)
    })

    it('fails and throws an 404 not found if RFP not found', async () => {
      mockReplyUseCase.execute.mockRejectedValueOnce(new RFPNotFoundError(''))

      await failWithStatusAndErrorCode(ErrorCode.ValidationHttpContent, 404)
    })

    it('fails and throws an 500 for missing data', async () => {
      mockReplyUseCase.execute.mockRejectedValueOnce(new MissingRequiredData())

      await failWithStatusAndErrorCode(ErrorCode.DatabaseMissingData, 500)
    })

    it('fails and throws an 500 for failed rabbitMQ connection', async () => {
      mockReplyUseCase.execute.mockRejectedValueOnce(new FailedProcessReplyActionError())

      await failWithStatusAndErrorCode(ErrorCode.ConnectionInternalMQ, 500)
    })

    it('fails and throws an conflict exception if the reply action is invalid', async () => {
      mockReplyUseCase.execute.mockRejectedValueOnce(new InvalidActionReplyError('Error'))

      await failWithStatusAndErrorCode(ErrorCode.ValidationHttpContent, 409)
    })

    async function failWithStatusAndErrorCode(errorCode: ErrorCode, status: number) {
      try {
        await replyActionController.create(RFP_ID, mockRFPResponse)
        fail('Should have thrown error')
      } catch (error) {
        expect(error.errorObject.errorCode).toBe(errorCode)
        expect(error.status).toBe(status)
      }
    }
  }
)
