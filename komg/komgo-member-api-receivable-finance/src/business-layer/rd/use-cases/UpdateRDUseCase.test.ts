import {
  buildFakeReceivablesDiscountingExtended,
  Currency,
  IReceivablesDiscounting,
  IReceivablesDiscountingBase,
  ReplyType
} from '@komgo/types'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ReceivablesDiscountingDataAgent, ReplyDataAgent } from '../../../data-layer/data-agents'
import { buildFakeReply } from '../../../data-layer/data-agents/utils/faker'
import { EntityNotFoundError, ValidationFieldError } from '../../errors'
import { ReceivablesDiscountingValidator, AcceptedRDValidator } from '../../validation'

import { UpdateRDUseCase } from './UpdateRDUseCase'

describe('UpdateRDUseCase', () => {
  const MOCK_RD_ID = 'rdStaticId'
  let usecase: UpdateRDUseCase
  let mockRdDataAgent: jest.Mocked<ReceivablesDiscountingDataAgent>
  let mockRdValidator: jest.Mocked<ReceivablesDiscountingValidator>
  let mockAcceptedRDValidator: jest.Mocked<AcceptedRDValidator>

  let mockOldRD: IReceivablesDiscounting

  beforeEach(() => {
    mockOldRD = buildFakeReceivablesDiscountingExtended(true)
    mockRdValidator = createMockInstance(ReceivablesDiscountingValidator)
    mockRdDataAgent = createMockInstance(ReceivablesDiscountingDataAgent)
    mockAcceptedRDValidator = createMockInstance(AcceptedRDValidator)

    usecase = new UpdateRDUseCase(mockRdValidator, mockRdDataAgent, mockAcceptedRDValidator)
  })

  describe('success', () => {
    it('can update an RD by appending', async () => {
      const mockUpdateRD: IReceivablesDiscountingBase = {
        ...createRDBaseUpdate(),
        invoiceAmount: 12312312
      }
      const mockUpdated = { ...mockUpdateRD, staticId: 'test', createdAt: '2019-01-01' }

      mockAcceptedRDValidator.validateRDAccepted.mockResolvedValueOnce({ rd: mockOldRD, acceptedReply: undefined })
      mockRdDataAgent.update.mockResolvedValueOnce(mockUpdated)

      const updated = await usecase.execute(MOCK_RD_ID, mockUpdateRD)

      expect(mockRdValidator.validateFields).toBeCalledWith(mockUpdateRD)
      expect(mockRdDataAgent.update).toBeCalledWith(MOCK_RD_ID, mockUpdateRD)
      expect(updated).toEqual(expect.objectContaining(mockUpdated))
    })

    it('can update an RD when all editable fields have been changed', async () => {
      const mockUpdateRD: IReceivablesDiscountingBase = {
        ...createRDBaseUpdate(),
        invoiceAmount: 12312312,
        discountingDate: '2019-06-01',
        titleTransfer: !mockOldRD.titleTransfer,
        dateOfPerformance: '2019-05-19'
      }
      const mockUpdated = { ...mockUpdateRD, staticId: 'test', createdAt: '2019-01-01' }
      mockAcceptedRDValidator.validateRDAccepted.mockResolvedValueOnce({ rd: mockOldRD, acceptedReply: undefined })
      mockRdDataAgent.update.mockResolvedValueOnce(mockUpdated)

      const updated = await usecase.execute(MOCK_RD_ID, mockUpdateRD)

      expect(mockRdValidator.validateFields).toBeCalledWith(mockUpdateRD)
      expect(mockRdDataAgent.update).toBeCalledWith(MOCK_RD_ID, mockUpdateRD)
      expect(updated).toEqual(expect.objectContaining(mockUpdated))
    })

    it('can update an RD when optional fields on the RD update object are set to undefined but they are deleted in the saved mongo object ', async () => {
      const mockUpdateRD: IReceivablesDiscountingBase = {
        ...createRDBaseUpdate(),
        invoiceAmount: 12312312,
        numberOfDaysDiscounting: undefined,
        advancedRate: undefined
      }
      delete mockOldRD.numberOfDaysDiscounting
      delete mockOldRD.advancedRate

      mockAcceptedRDValidator.validateRDAccepted.mockResolvedValueOnce({ rd: mockOldRD, acceptedReply: undefined })

      await usecase.execute(MOCK_RD_ID, mockUpdateRD)

      expect(mockRdValidator.validateFields).toBeCalledWith(mockUpdateRD)
      expect(mockRdDataAgent.update).toBeCalledWith(MOCK_RD_ID, mockUpdateRD)
    })
  })

  describe('failures', () => {
    it('will throw an error if the non editable field traderReference has been changed', async () => {
      const invalidMockRdUpdate = {
        ...createRDBaseUpdate(),
        tradeReference: null
      }
      mockAcceptedRDValidator.validateRDAccepted.mockResolvedValueOnce({ rd: mockOldRD, acceptedReply: undefined })

      try {
        await usecase.execute(MOCK_RD_ID, invalidMockRdUpdate)
        fail('should have thrown error')
      } catch (error) {
        expect(error.validationErrors).toMatchObject({
          tradeReference: ['Field is not editable']
        })
      }
    })

    it('will throw an error if an optional non editable field has been added', async () => {
      delete mockOldRD.advancedRate
      const invalidMockRdUpdate: IReceivablesDiscountingBase = {
        ...createRDBaseUpdate(),
        advancedRate: 55
      }
      delete mockOldRD.advancedRate
      mockAcceptedRDValidator.validateRDAccepted.mockResolvedValueOnce({ rd: mockOldRD, acceptedReply: undefined })

      try {
        await usecase.execute(MOCK_RD_ID, invalidMockRdUpdate)
        fail('should have thrown error')
      } catch (error) {
        expect(error.validationErrors).toMatchObject({
          advancedRate: ['Field is not editable']
        })
      }
    })

    it('will throw an error if a non editable field has been added', async () => {
      const invalidMockRdUpdate: IReceivablesDiscountingBase = {
        ...createRDBaseUpdate(),
        advancedRate: 85
      }
      delete mockOldRD.advancedRate
      mockAcceptedRDValidator.validateRDAccepted.mockResolvedValueOnce({ rd: mockOldRD, acceptedReply: undefined })

      try {
        await usecase.execute(MOCK_RD_ID, invalidMockRdUpdate)
        fail('should have thrown error')
      } catch (error) {
        expect(error.validationErrors).toMatchObject({
          advancedRate: ['Field is not editable']
        })
      }
    })

    it('will throw an error if fields that are not editable have changed', async () => {
      const invalidMockRdUpdate = {
        ...createRDBaseUpdate(),
        tradeReference: { source: 'hugh', sourceId: 'id123', sellerEtrmId: '123sell' },
        currency: Currency.EUR,
        advancedRate: 100011
      }
      mockAcceptedRDValidator.validateRDAccepted.mockResolvedValueOnce({ rd: mockOldRD, acceptedReply: undefined })

      try {
        await usecase.execute(MOCK_RD_ID, invalidMockRdUpdate)
        fail('should have thrown error')
      } catch (error) {
        expect(error.validationErrors).toMatchObject({
          tradeReference: ['Field is not editable'],
          currency: ['Field is not editable'],
          advancedRate: ['Field is not editable']
        })
      }
    })
  })

  function createRDBaseUpdate(): IReceivablesDiscountingBase {
    const update = { ...mockOldRD }
    delete update.staticId
    delete update.createdAt
    delete update.updatedAt
    return update
  }
})
