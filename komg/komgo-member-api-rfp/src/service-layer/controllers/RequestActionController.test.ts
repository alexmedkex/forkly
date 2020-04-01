import 'reflect-metadata'

// tslint:disable-next-line
import {
  IRequestForProposalBase,
  IOutboundActionResult,
  ActionStatus,
  ActionType,
  buildFakeRequestForProposalBase,
  buildFakeActionExtended
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import RFPNotFoundError from '../../business-layer/errors/RFPNotFoundError'
import { GetActionsUseCase } from '../../business-layer/GetActionsUseCase'
import { CreateRequestUseCase } from '../../business-layer/outbound-actions/corporate/CreateRequestUseCase'
import SendOutboundRequestUseCase from '../../business-layer/outbound-actions/corporate/SendOutboundRequestUseCase'
import CreateRFPRequest from '../requests/CreateRFPRequest'
import { RequestActionController } from './RequestActionController'

describe('RequestActionController', () => {
  let mockCreateRequestUseCase: jest.Mocked<CreateRequestUseCase>
  let mockSendOutboundRequestUseCase: jest.Mocked<SendOutboundRequestUseCase>
  let mockGetActionsUseCase: jest.Mocked<GetActionsUseCase>
  let rfpBaseData: IRequestForProposalBase
  let rfpRequest: CreateRFPRequest
  let requestActionController: RequestActionController

  const MOCK_STATIC_ID = '0b88f604-ded8-4fa1-a419-701406214123'
  const participantIds = ['123', '567', '789']
  const mockActionStatuses: IOutboundActionResult[] = [
    { status: ActionStatus.Processed, recipientStaticId: '123' },
    { status: ActionStatus.Failed, recipientStaticId: '567' },
    { status: ActionStatus.Processed, recipientStaticId: '789' }
  ]

  beforeEach(() => {
    mockCreateRequestUseCase = createMockInstance(CreateRequestUseCase)
    mockSendOutboundRequestUseCase = createMockInstance(SendOutboundRequestUseCase)
    mockGetActionsUseCase = createMockInstance(GetActionsUseCase)
    rfpBaseData = buildFakeRequestForProposalBase()
    rfpRequest = { rfp: rfpBaseData, participantStaticIds: participantIds }

    requestActionController = new RequestActionController(
      mockCreateRequestUseCase,
      mockSendOutboundRequestUseCase,
      mockGetActionsUseCase
    )
  })

  it('succeeds and returns the static Id of the RFP', async () => {
    mockCreateRequestUseCase.execute.mockResolvedValueOnce(MOCK_STATIC_ID)
    mockSendOutboundRequestUseCase.execute.mockResolvedValueOnce(mockActionStatuses)

    const result = await requestActionController.create(rfpRequest)

    expect(result).toMatchObject({ staticId: MOCK_STATIC_ID, actionStatuses: mockActionStatuses })
    expect(mockCreateRequestUseCase.execute).toBeCalledWith(rfpBaseData, participantIds)
    expect(mockSendOutboundRequestUseCase.execute).toBeCalledWith(MOCK_STATIC_ID)
  })

  it('fails and throws an internal server execption if it fails to create RFP Request', async () => {
    mockCreateRequestUseCase.execute.mockRejectedValueOnce(new Error())

    await expect(requestActionController.create(rfpRequest)).rejects.toMatchObject({ status: 500 })
  })

  it('fails and throws an internal server execption if it fails to send RFP Request', async () => {
    mockSendOutboundRequestUseCase.execute.mockRejectedValueOnce(new Error())

    await expect(requestActionController.create(rfpRequest)).rejects.toMatchObject({ status: 500 })
  })

  it('returns the RFP request actions for a given RFP ID', async () => {
    const rfpId = 'rfpId'
    const action = buildFakeActionExtended(ActionType.Request, true)
    mockGetActionsUseCase.execute.mockResolvedValueOnce([action])

    const result = await requestActionController.getRequestActions(rfpId)

    expect(result).toMatchObject({ actions: [action] })
    expect(mockGetActionsUseCase.execute).toBeCalledWith(rfpId, ActionType.Request)
  })

  it('returns 404 when the RFP does not exist', async () => {
    const rfpId = 'rfpId'
    mockGetActionsUseCase.execute.mockRejectedValue(new RFPNotFoundError('error'))

    expect.assertions(1)
    try {
      await requestActionController.getRequestActions(rfpId)
    } catch (error) {
      expect(error.status).toBe(404)
    }
  })
})
