import { ErrorCode } from '@komgo/error-utilities'
import { Currency, ICreditLineSaveRequest } from '@komgo/types'
import { stringify } from 'querystring'
import 'reflect-metadata'

import { ICreditLineService } from '../../business-layer/CreditLineService'
import { CreditLineValidationFactory } from '../../business-layer/CreditLineValidationFactory'
import { ICreditLineValidationService } from '../../business-layer/CreditLineValidationService'
import { ValidationError } from '../../business-layer/errors/ValidationError'
import { PRODUCT_ID, SUB_PRODUCT_ID } from '../../business-layer/notifications/enums'
import { IRequestValidationService } from '../../business-layer/RequestValidationService'
import { ICreditLineDataAgent } from '../../data-layer/data-agents/ICreditLineDataAgent'
import { DataAccessException, DATA_ACCESS_ERROR } from '../../data-layer/exceptions/DataAccessException'

import { CreditLineController } from './CreditLineController'

let dataAgent: ICreditLineDataAgent
let creditLineService: ICreditLineService
let requestValidationService: IRequestValidationService
let creditLineValidationService: ICreditLineValidationService
let controller: CreditLineController

const mockData: ICreditLineSaveRequest = {
  // staticId: 'test-static-id',
  counterpartyStaticId: '111222333',
  context: {
    productId: PRODUCT_ID.TradeFinance,
    subProductId: SUB_PRODUCT_ID.RiskCover
  },
  appetite: true,
  currency: Currency.USD,
  creditLimit: 100,
  availability: false,
  availabilityAmount: 100,
  data: {},
  sharedCreditLines: []
}

describe('CreditLineController', () => {
  beforeEach(() => {
    dataAgent = {
      create: jest.fn(),
      get: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn()
    }

    creditLineService = {
      create: jest.fn().mockReturnValue('static-id'),
      // update: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      get: jest.fn(),
      getByProduct: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn()
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

    controller = new CreditLineController(
      dataAgent,
      creditLineService,
      new CreditLineValidationFactory(creditLineValidationService, requestValidationService)
    )
  })

  describe('.find', () => {
    it('returns credit lines', async () => {
      const filter = {}
      const query = stringify(filter)
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      creditLineService.find = jest.fn().mockReturnValue([mockData])
      expect(await controller.find('productId', 'subProductId', query)).toEqual([mockData])
    })

    it('returns credit lines with query string', async () => {
      const filter = {
        something: 'something'
      }
      const query = JSON.stringify(filter)
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      await expect(controller.find('productId', 'subProductId', query)).rejects.toBeDefined()
    })

    it('retrow error', async () => {
      dataAgent.find = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      creditLineService.find = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(controller.find('productId', 'subProductId')).rejects.toMatchObject({ error: 'error' })
    })
  })

  describe('.getById', () => {
    it('returns credit lines by id', async () => {
      creditLineService.get = jest.fn().mockImplementation(() => Promise.resolve(mockData))
      const result = await controller.getById('123456789')

      expect(creditLineService.get).toBeCalledWith('123456789')
      expect(result).toEqual(mockData)
    })
    it('return credit lines by id failed - not found error', async () => {
      creditLineService.get = jest.fn().mockImplementationOnce(() => {
        throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'NotFound')
      })
      await expect(controller.getById('123456789')).rejects.toThrowError(Error)
    })
  })

  describe('.getByProductId', () => {
    it('return credit line by product id', async () => {
      creditLineService.getByProduct = jest.fn().mockImplementation(() => Promise.resolve(mockData))
      const result = await controller.getByProduct('123456789', '1234', '123456')

      expect(creditLineService.getByProduct).toBeCalledWith('123456789', '1234', '123456')
      expect(result).toEqual(mockData)
    })
    it('return credit line by product by id failed - not found error', async () => {
      creditLineService.getByProduct = jest.fn().mockImplementationOnce(() => {
        throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'NotFound')
      })
      await expect(controller.getByProduct('123456789', '1234', '123456')).rejects.toThrowError(Error)
    })
  })

  describe('.delete', () => {
    it('successfully delete credit line', done => {
      creditLineService.delete = jest.fn().mockImplementation(() => Promise.resolve('123456789'))

      return controller.delete('123456789').then(() => done())
    })
  })

  describe('.create', () => {
    it('create new credit line successfully', async () => {
      creditLineService.create = jest.fn().mockImplementation(() => Promise.resolve('123456789'))
      const result = await controller.create(PRODUCT_ID.TradeFinance, SUB_PRODUCT_ID.RiskCover, { ...mockData })
      expect(result).toEqual('123456789')
    })

    it('create new credit line failed - Invalid credit line format', async () => {
      const error = new ValidationError(
        `Received request doesn't have valid context`,
        ErrorCode.ValidationInvalidOperation,
        null
      )
      creditLineValidationService.validateRiskCover = jest.fn().mockImplementationOnce(() => {
        throw error
      })
      creditLineService.create = jest.fn().mockImplementation(() => Promise.resolve('123456789'))
      const invalidMockData = {
        ...mockData,
        context: {
          productId: '',
          subProductId: SUB_PRODUCT_ID.RiskCover
        }
      }
      await expect(controller.create('productId', 'subProductId', { ...invalidMockData })).rejects.toThrow(error)
    })

    it('database error on create', async () => {
      creditLineService.create = jest.fn().mockImplementation(() => {
        throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'InvalidData')
      })

      await expect(controller.create('productId', 'subProductId', { ...mockData })).rejects.toThrowError(Error)
    })
  })

  describe('.update', () => {
    it('update credit line successfully', async () => {
      creditLineService.update = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ...mockData,
          currency: Currency.EUR
        })
      )
      const result = await controller.update('123456789', { ...mockData, currency: Currency.EUR })
      expect(result.currency).toEqual(Currency.EUR)
    })
    it('update credit line failed - Invalid credit line format', async () => {
      const error = new ValidationError(
        `Received request doesn't have valid context`,
        ErrorCode.ValidationInvalidOperation,
        null
      )
      creditLineValidationService.validate = jest.fn().mockImplementationOnce(() => {
        throw error
      })
      const invalidMockData = {
        ...mockData,
        context: {
          productId: '',
          subProductId: '1'
        }
      }
      await expect(controller.update('1234567890', { ...invalidMockData })).rejects.toThrow(error)
    })
    it('update credit line failed - not found credit line', async () => {
      creditLineService.update = jest.fn().mockImplementation(() => {
        throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, 'NotFound')
      })
      await expect(controller.update('123456789', { ...mockData })).rejects.toThrow(Error)
    })
  })
})
