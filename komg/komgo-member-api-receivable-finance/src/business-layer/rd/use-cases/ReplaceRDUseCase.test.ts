import {
  IReceivablesDiscounting,
  IReceivablesDiscountingBase,
  buildFakeReceivablesDiscountingExtended
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'
import { v4 as uuid4 } from 'uuid'

import { ReceivablesDiscountingDataAgent, RFPDataAgent } from '../../../data-layer/data-agents'
import { IRFPRequest } from '../../../data-layer/models/rfp/IRFPRequestDocument'
import { ValidationFieldError, EntityNotFoundError } from '../../errors'
import { ReceivablesDiscountingValidator } from '../../validation'

import { ReplaceRDUseCase } from './ReplaceRDUseCase'

describe('ReplaceRDUseCase', () => {
  const MOCK_RD_ID = 'rdStaticId'
  let useCase: ReplaceRDUseCase
  let mockRdDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockRdValidator: jest.Mocked<ReceivablesDiscountingValidator>
  let mockRFPDataAgent: jest.Mocked<RFPDataAgent>

  let mockOldRD: IReceivablesDiscounting
  let mockRFP: IRFPRequest

  beforeEach(() => {
    mockOldRD = buildFakeReceivablesDiscountingExtended(true)
    mockRFP = fakeRFP({ rdId: mockOldRD.staticId })
    mockRdValidator = createMockInstance(ReceivablesDiscountingValidator)
    mockRdDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockRFPDataAgent = createMockInstance(RFPDataAgent)

    useCase = new ReplaceRDUseCase(mockRdDataAgent, mockRFPDataAgent, mockRdValidator)
  })

  describe('success', () => {
    it('can replace an RD and change any field', async () => {
      const mockUpdate: IReceivablesDiscountingBase = {
        ...createRDBaseUpdate(),
        invoiceAmount: 12312312,
        discountingDate: '2019-06-01',
        titleTransfer: !mockOldRD.titleTransfer,
        dateOfPerformance: '2019-05-19',
        numberOfDaysDiscounting: 20,
        advancedRate: 40
      }
      const mockReplaced = { ...mockUpdate, staticId: 'test', createdAt: '2019-01-01' }
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce(mockOldRD).mockResolvedValueOnce(mockReplaced)
      mockRdDataAgent.replace.mockResolvedValueOnce(mockReplaced)

      const replaced = await useCase.execute(MOCK_RD_ID, mockUpdate)

      expect(mockRdDataAgent.replace).toBeCalledWith(MOCK_RD_ID, mockUpdate)
      expect(replaced).toEqual(expect.objectContaining(mockReplaced))
    })
  })

  describe('failures', () => {
    it('should fail with ValidationFieldError if any RFP request exists (it has been requested)', async () => {
      const mockUpdate = createRDBaseUpdate()
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce(mockOldRD)
      mockRFPDataAgent.findByRdId.mockResolvedValueOnce(mockRFP)

      const promise = useCase.execute(MOCK_RD_ID, mockUpdate)

      await expect(promise).rejects.toThrowError(ValidationFieldError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"An RFP already exists for this RD"`)
      expect(mockRFPDataAgent.findByRdId).toHaveBeenCalledWith(MOCK_RD_ID)
    })

    it('should fail with ValidationFieldError if a field does not pass usual RD validation', async () => {
      const mockUpdate: IReceivablesDiscountingBase = createRDBaseUpdate()
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce(mockOldRD)
      mockRdValidator.validateFields.mockImplementationOnce(() => {
        throw new ValidationFieldError('Invalid field', [] as any)
      })

      const promise = useCase.execute(MOCK_RD_ID, mockUpdate)

      await expect(promise).rejects.toThrowError(ValidationFieldError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Invalid field"`)
    })

    it('should fail with EntityNotFoundError if the data agent returns null', async () => {
      const mockUpdate: IReceivablesDiscountingBase = createRDBaseUpdate()
      mockRdDataAgent.findByStaticId.mockResolvedValueOnce(mockOldRD)
      mockRdDataAgent.replace.mockResolvedValueOnce(null)

      const promise = useCase.execute(MOCK_RD_ID, mockUpdate)

      await expect(promise).rejects.toThrowError(EntityNotFoundError)
      await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"RD with ID \\"rdStaticId\\" was not found"`)
    })
  })

  const createRDBaseUpdate = ({
    staticId,
    createdAt,
    updatedAt,
    ...update
  }: IReceivablesDiscounting = mockOldRD): IReceivablesDiscountingBase => ({
    ...update
  })

  const fakeRFP = (overrides: Partial<IRFPRequest> = {}): IRFPRequest => ({
    rfpId: uuid4(),
    participantStaticIds: [uuid4()],
    rdId: uuid4(),
    senderStaticId: 'company-static-id',
    ...overrides
  })
})
