import {
  buildFakeDepositLoan,
  DepositLoanType,
  buildFakeDepositLoanResponse,
  buildFakeSaveDepositLoan,
  ISaveDepositLoan,
  DepositLoanPeriod,
  Currency
} from '@komgo/types'
import createMockInstance from 'jest-create-mock-instance'
import { stringify } from 'qs'

import DepositLoanService, { IDepositLoanService } from '../../business-layer/deposit-loan/DepositLoanService'

import { DepositLoanController } from './DepositLoanController'
import { DepositLoanTypeFeature } from './utils'
import {
  IDepositLoanValidationService,
  DepositLoanValidationService
} from '../../business-layer/deposit-loan/DepositLoanValidationService'

let depositLoanValidationService: IDepositLoanValidationService

describe('DepositLoanController', () => {
  let mockDepositLoanService: jest.Mocked<IDepositLoanService>
  let controller: DepositLoanController
  const mockResponseData = buildFakeDepositLoanResponse()

  beforeEach(() => {
    mockDepositLoanService = createMockInstance(DepositLoanService)
    depositLoanValidationService = new DepositLoanValidationService()
    controller = new DepositLoanController(mockDepositLoanService, depositLoanValidationService)
  })

  describe('.find', () => {
    it('should return deposit / loan', async () => {
      const filter = {}
      const query = stringify(filter)
      mockDepositLoanService.find.mockResolvedValue([mockResponseData])
      expect(await controller.find(DepositLoanTypeFeature.Deposit, query)).toEqual([mockResponseData])
      expect(mockDepositLoanService.find).toHaveBeenCalledWith(DepositLoanType.Deposit, expect.anything())
    })

    it('should fail on invalid filter', async () => {
      const filter = {
        something: 'something'
      }
      const query = JSON.stringify(filter)
      await expect(controller.find(DepositLoanTypeFeature.Deposit, query)).rejects.toBeDefined()
    })
  })

  describe('.getById', () => {
    it('should return deposit / loan', async () => {
      mockDepositLoanService.get.mockResolvedValue(mockResponseData)
      expect(await controller.getById(DepositLoanTypeFeature.Loan, 'static-id')).toEqual(mockResponseData)
      expect(mockDepositLoanService.get).toHaveBeenCalledWith(DepositLoanType.Loan, 'static-id')
    })

    it('should rethrow error', async () => {
      const error = new Error('error')
      mockDepositLoanService.get.mockRejectedValue(error)

      await expect(controller.getById(DepositLoanTypeFeature.Deposit, 'static-id')).rejects.toBe(error)
    })
  })

  describe('.create', () => {
    const mockRequest = buildFakeSaveDepositLoan()
    it('should save data', async () => {
      mockDepositLoanService.create.mockResolvedValue('static-id')
      expect(await controller.create(DepositLoanTypeFeature.Loan, mockRequest)).toEqual('static-id')
      expect(mockDepositLoanService.create).toHaveBeenCalledWith(DepositLoanType.Loan, mockRequest)
    })

    it('invalid currency', async () => {
      const mockInvalidRequest = {
        ...mockRequest,
        currency: 'currency',
        type: DepositLoanType.Deposit
      }
      const error = new Error(`Invalid ${mockInvalidRequest.type} format.`)
      await expect(
        controller.create(DepositLoanTypeFeature.Deposit, mockInvalidRequest as ISaveDepositLoan)
      ).rejects.toEqual(error)
    })

    it('invalid period and duration - Overnight', async () => {
      const mockInvalidRequest = {
        ...mockRequest,
        period: DepositLoanPeriod.Overnight,
        periodDuration: 1,
        type: DepositLoanType.Deposit
      }
      const error = new Error(`Invalid ${mockInvalidRequest.type} format.`)
      await expect(controller.create(DepositLoanTypeFeature.Deposit, mockInvalidRequest)).rejects.toEqual(error)
    })

    it('invalid period and duration - months', async () => {
      const mockInvalidRequest = {
        ...mockRequest,
        period: DepositLoanPeriod.Months,
        periodDuration: null,
        type: DepositLoanType.Deposit
      }
      const error = new Error(`Invalid ${mockInvalidRequest.type} format.`)
      await expect(controller.create(DepositLoanTypeFeature.Deposit, mockInvalidRequest)).rejects.toEqual(error)
    })
  })

  describe('.update', () => {
    it('should save data', async () => {
      const mockRequest = {
        ...buildFakeSaveDepositLoan(),
        static: 'static-id',
        currency: Currency.CHF,
        period: DepositLoanPeriod.Months,
        periodDuration: 3
      }
      await controller.update(DepositLoanTypeFeature.Loan, 'static-id', mockRequest)
      expect(mockDepositLoanService.update).toHaveBeenCalledWith(DepositLoanType.Loan, 'static-id', mockRequest)
    })
  })

  describe('.delete', () => {
    it('should delete data', async () => {
      controller.delete(DepositLoanTypeFeature.Loan, 'static-id')
      expect(mockDepositLoanService.delete).toHaveBeenCalledWith(DepositLoanType.Loan, 'static-id')
    })
  })
})
