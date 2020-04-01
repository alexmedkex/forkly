import { Currency, DepositLoanPeriod, DepositLoanType, DepositLoanRequestType } from '@komgo/types'

import { IRequestValidationService } from '../../business-layer/RequestValidationService'
import { DataAccessException, DATA_ACCESS_ERROR } from '../../data-layer/exceptions/DataAccessException'

import { DepositLoanRequestController } from './DepositLoanRequestController'
import {
  DepositLoanValidationService,
  IDepositLoanValidationService
} from '../../business-layer/deposit-loan/DepositLoanValidationService'
import { ICreditLineValidationService } from '../../business-layer/CreditLineValidationService'
import { getDepositLoanFeatureType } from '../../business-layer/enums/feature'
import { IDepositLoanRequestDataAgent } from '../../data-layer/data-agents/IDepositLoanRequestDataAgent'
import { IDepositLoanRequestService } from '../../business-layer/deposit-loan/DepositLoanRequestService'
import { DepositLoanTypeFeature, DepositLoanRequestTypeFeature } from './utils'

const mockData = {
  comment: 'comment',
  currency: Currency.AED,
  period: DepositLoanPeriod.Days,
  periodDuration: 1,
  type: getDepositLoanFeatureType(DepositLoanType.Deposit),
  companyIds: ['company-id-1', 'company-id-2'],
  requestType: DepositLoanRequestType.Requested
}

const receivedMockData = {
  currency: Currency.AED,
  period: DepositLoanPeriod.Days,
  periodDuration: 1,
  type: getDepositLoanFeatureType(DepositLoanType.Deposit),
  comment: 'comment',
  companyIds: ['company-id-1', 'company-id-2'],
  requestType: DepositLoanRequestType.Received
}

let dataAgent: IDepositLoanRequestDataAgent
let depositLoanRequestService: IDepositLoanRequestService
let controller: DepositLoanRequestController
let requestValidationService: IRequestValidationService
let creditLineValidationService: ICreditLineValidationService
let depositLoanValidationService: IDepositLoanValidationService

describe('DepositLoanRequestController', () => {
  beforeEach(() => {
    dataAgent = {
      create: jest.fn(),
      findOne: jest.fn(),
      get: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      findForCompaniesAndType: jest.fn()
    }

    depositLoanRequestService = {
      create: jest.fn().mockReturnValue(['static-id']),
      closeAllPendingRequests: jest.fn(),
      getPendingRequest: jest.fn(),
      requestReceived: jest.fn(),
      closeAllPendingRequestsByRequestIds: jest.fn(),
      markCompleted: jest.fn(),
      requestDeclined: jest.fn()
    }
    creditLineValidationService = {
      validate: jest.fn().mockReturnValue(true),
      validateBankLine: jest.fn().mockReturnValue(true),
      validateRiskCover: jest.fn().mockReturnValue(true),
      validateCreditLineCounterparty: jest.fn(),
      validateCreditLineOwner: jest.fn(),
      validateNonFinanceInstitution: jest.fn(),
      validateFinanceInstitution: jest.fn()
    }
    requestValidationService = {
      validate: jest.fn()
    }
    depositLoanValidationService = {
      validateDepositLoan: jest.fn(),
      validateDepositLoanRequest: jest.fn()
    }
    controller = new DepositLoanRequestController(dataAgent, depositLoanRequestService, depositLoanValidationService)
  })

  describe('.find', () => {
    it('returns deposit loan requests', async () => {
      const filter = {}
      const query = JSON.stringify(filter)
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      expect(
        await controller.find(DepositLoanTypeFeature.Deposit, DepositLoanRequestTypeFeature.Requested, query)
      ).toEqual([mockData])
    })

    it('returns deposit loan requests', async () => {
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      expect(await controller.find(DepositLoanTypeFeature.Deposit, DepositLoanRequestTypeFeature.Requested)).toEqual([
        mockData
      ])
    })

    it('returns deposit loan requests with query string', async () => {
      const filter = {
        something: 'something'
      }
      const query = JSON.stringify(filter)
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      await expect(
        controller.find(DepositLoanTypeFeature.Deposit, DepositLoanRequestTypeFeature.Requested, query)
      ).rejects.toBeDefined()
    })
  })

  describe('.getById', () => {
    it('returns credit line request', async () => {
      dataAgent.get = jest.fn().mockReturnValue(mockData)
      expect(
        await controller.getById(DepositLoanTypeFeature.Deposit, DepositLoanRequestTypeFeature.Requested, 'id')
      ).toEqual(mockData)
    })

    it('retrow error', async () => {
      dataAgent.get = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(
        controller.getById(DepositLoanTypeFeature.Deposit, DepositLoanRequestTypeFeature.Requested, 'id')
      ).rejects.toMatchObject({ error: 'error' })
    })
  })

  describe('.getByCurrencyPeriod', () => {
    it('returns credit line request', async () => {
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      expect(
        await controller.getByCurrencyPeriod(
          DepositLoanTypeFeature.Deposit,
          Currency.AED,
          DepositLoanPeriod.Days,
          1,
          DepositLoanRequestTypeFeature.Requested
        )
      ).toEqual([mockData])
    })

    it('retrow error', async () => {
      dataAgent.find = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(
        controller.getByCurrencyPeriod(
          DepositLoanTypeFeature.Deposit,
          Currency.AED,
          DepositLoanPeriod.Days,
          1,
          DepositLoanRequestTypeFeature.Requested
        )
      ).rejects.toMatchObject({
        error: 'error'
      })
    })
  })

  describe('.create', () => {
    it('create new credit line request successfully', async () => {
      depositLoanRequestService.create = jest
        .fn()
        .mockImplementation(() => Promise.resolve(['company-id-1', 'company-id-2']))
      const result = await controller.create(DepositLoanTypeFeature.Deposit, {
        ...mockData,
        type: DepositLoanType.Deposit
      })
      expect(result).toEqual(['company-id-1', 'company-id-2'])
    })

    it('database error on create', async () => {
      depositLoanRequestService.create = jest.fn().mockImplementation(() => {
        throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'InvalidData')
      })

      await expect(
        controller.create(DepositLoanTypeFeature.Deposit, { ...mockData, type: DepositLoanType.Deposit })
      ).rejects.toThrowError(Error)
    })
  })
})
