import { IOutboundActionResult, ActionStatus, ActionType } from '@komgo/types'
// tslint:disable-next-line
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import SendOutboundReplyUseCase from '../SendOutboundReplyUseCase'

import { CreateFinancialInstitutionReplyUseCase } from './CreateFinancialInstitutionReplyUseCase'
import { ReplyUseCase } from './ReplyUseCase'

describe('ReplyUseCase', () => {
  const RESPONSE_DATA: any = { data: 'mockData' }
  const ACTION_RESPONSE: IOutboundActionResult = { recipientStaticId: '123', status: ActionStatus.Processed }
  const RFP_ID = 'rfpId123'

  let mockSendOutboundReplyUseCase: jest.Mocked<SendOutboundReplyUseCase>
  let mockCreateFinancialInstitutionReplyUseCase: jest.Mocked<CreateFinancialInstitutionReplyUseCase>
  let replyUseCase: ReplyUseCase

  beforeEach(() => {
    mockCreateFinancialInstitutionReplyUseCase = createMockInstance(CreateFinancialInstitutionReplyUseCase)
    mockSendOutboundReplyUseCase = createMockInstance(SendOutboundReplyUseCase)

    replyUseCase = new ReplyUseCase(mockCreateFinancialInstitutionReplyUseCase, mockSendOutboundReplyUseCase)
  })

  it('should return a result for sending the Response Action', async () => {
    mockCreateFinancialInstitutionReplyUseCase.execute.mockResolvedValue('actionId')
    mockSendOutboundReplyUseCase.execute.mockResolvedValue(ACTION_RESPONSE)

    const result = await replyUseCase.execute(RFP_ID, ActionType.Response, RESPONSE_DATA)

    expect(result).toMatchObject({ rfpId: RFP_ID, actionStatus: ACTION_RESPONSE })
  })
})
