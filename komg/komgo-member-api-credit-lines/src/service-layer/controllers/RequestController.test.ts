import { CreditLineRequestType } from '@komgo/types'

import { ICreditLineRequestService } from '../../business-layer/CreditLineRequestService'
import { IRequestValidationService } from '../../business-layer/RequestValidationService'
import { ICreditLineRequestDataAgent } from '../../data-layer/data-agents/ICreditLineRequestDataAgent'
import { DataAccessException, DATA_ACCESS_ERROR } from '../../data-layer/exceptions/DataAccessException'

import { RequestController } from './RequestController'
import { ValidationError } from '../../business-layer/errors/ValidationError'
import { ErrorCode } from '@komgo/error-utilities'
import { PRODUCT_ID, SUB_PRODUCT_ID } from '../../business-layer/notifications/enums'
import { CreditLineValidationFactory } from '../../business-layer/CreditLineValidationFactory'
import { ICreditLineValidationService } from '../../business-layer/CreditLineValidationService'

const mockData = {
  context: {
    productId: PRODUCT_ID.TradeFinance,
    subProductId: SUB_PRODUCT_ID.RiskCover
  },
  comment: 'comment',
  counterpartyStaticId: 'counterpartyStaticId',
  companyIds: ['company-id-1', 'company-id-2'],
  requestType: CreditLineRequestType.Requested
}

const receivedMockData = {
  context: {
    productId: PRODUCT_ID.TradeFinance,
    subProductId: SUB_PRODUCT_ID.RiskCover
  },
  comment: 'comment',
  counterpartyStaticId: 'counterpartyStaticId',
  companyIds: ['company-id-1', 'company-id-2'],
  requestType: CreditLineRequestType.Received
}

let dataAgent: ICreditLineRequestDataAgent
let creditLineRequestService: ICreditLineRequestService
let controller: RequestController
let requestValidationService: IRequestValidationService
let creditLineValidationService: ICreditLineValidationService

describe('RequestController', () => {
  beforeEach(() => {
    dataAgent = {
      create: jest.fn(),
      findOne: jest.fn(),
      get: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      find: jest.fn()
    }

    creditLineRequestService = {
      create: jest.fn().mockReturnValue(['static-id']),
      closeAllPendingRequests: jest.fn(),
      closePendingSentRequest: jest.fn(),
      getPendingRequest: jest.fn(),
      markCompleted: jest.fn(),
      requestDeclined: jest.fn(),
      requestReceived: jest.fn()
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
    controller = new RequestController(
      dataAgent,
      creditLineRequestService,
      new CreditLineValidationFactory(creditLineValidationService, requestValidationService)
    )
  })

  describe('.find', () => {
    it('returns credit line requests', async () => {
      const filter = {}
      const query = JSON.stringify(filter)
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      expect(await controller.findSent('productId', 'subProductId', query)).toEqual([mockData])
    })

    it('returns credit line requests', async () => {
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      expect(await controller.findSent('productId', 'subProductId')).toEqual([mockData])
    })

    it('returns credit line requests with query string', async () => {
      const filter = {
        something: 'something'
      }
      const query = JSON.stringify(filter)
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      await expect(controller.findSent('productId', 'subProductId', query)).rejects.toBeDefined()
    })
  })

  describe('.findReceived', () => {
    it('returns received credit line requests', async () => {
      const filter = {}
      const query = JSON.stringify(filter)
      dataAgent.find = jest.fn().mockReturnValue([receivedMockData])
      expect(await controller.findReceived('productId', 'subProductId', query)).toEqual([receivedMockData])
    })

    it('returns received credit line requests', async () => {
      dataAgent.find = jest.fn().mockReturnValue([receivedMockData])
      expect(await controller.findReceived('productId', 'subProductId')).toEqual([receivedMockData])
    })

    it('returns credit line requests with query string', async () => {
      const filter = {
        something: 'something'
      }
      const query = JSON.stringify(filter)
      dataAgent.find = jest.fn().mockReturnValue([receivedMockData])
      await expect(controller.findReceived('productId', 'subProductId', query)).rejects.toBeDefined()
    })
  })

  describe('.getById', () => {
    it('returns credit line request', async () => {
      dataAgent.get = jest.fn().mockReturnValue(mockData)
      expect(await controller.getById('id')).toEqual(mockData)
    })

    it('retrow error', async () => {
      dataAgent.get = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(controller.getById('id')).rejects.toMatchObject({ error: 'error' })
    })
  })

  describe('.getReceivedById', () => {
    it('returns credit line request', async () => {
      dataAgent.get = jest.fn().mockReturnValue(receivedMockData)
      expect(await controller.getReceivedById('id')).toEqual(receivedMockData)
    })

    it('retrow error', async () => {
      dataAgent.get = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(controller.getReceivedById('id')).rejects.toMatchObject({ error: 'error' })
    })
  })

  describe('.getByProduct', () => {
    it('returns credit line request', async () => {
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      expect(await controller.getByProduct('id', 'subProductId', 'counterpartyStaticId')).toEqual([mockData])
    })

    it('retrow error', async () => {
      dataAgent.find = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(controller.getByProduct('id', 'subProductId', 'counterpartyStaticId')).rejects.toMatchObject({
        error: 'error'
      })
    })
  })

  describe('.getByCounterparty', () => {
    it('returns credit line request', async () => {
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      expect(await controller.getByCounterparty('productId', 'subProductId', 'counterpartyId')).toEqual([mockData])
    })

    it('retrow error', async () => {
      dataAgent.find = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(controller.getByCounterparty('productId', 'subProductId', 'counterpartyId')).rejects.toMatchObject({
        error: 'error'
      })
    })
  })

  describe('.getReceivedByProduct', () => {
    it('returns credit line request', async () => {
      dataAgent.find = jest.fn().mockReturnValue([receivedMockData])
      expect(await controller.getReceivedByProduct('productId', 'subProductId', 'counterpartyId')).toEqual([
        receivedMockData
      ])
    })

    it('retrow error', async () => {
      dataAgent.find = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(
        controller.getReceivedByProduct('productId', 'subProductId', 'counterpartyId')
      ).rejects.toMatchObject({
        error: 'error'
      })
    })
  })

  describe('.create', () => {
    it('create new credit line request successfully', async () => {
      creditLineRequestService.create = jest
        .fn()
        .mockImplementation(() => Promise.resolve(['company-id-1', 'company-id-2']))
      const result = await controller.create(PRODUCT_ID.TradeFinance, SUB_PRODUCT_ID.RiskCover, { ...mockData })
      expect(result).toEqual(['company-id-1', 'company-id-2'])
    })

    it('database error on create', async () => {
      creditLineRequestService.create = jest.fn().mockImplementation(() => {
        throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'InvalidData')
      })

      await expect(controller.create('productId', 'subProductId', { ...mockData })).rejects.toThrowError(Error)
    })

    it('validation error', async () => {
      const error = new ValidationError('Validation error.', ErrorCode.DatabaseInvalidData, {
        errorValidationFail: ['validation error']
      })

      requestValidationService.validate = jest.fn().mockImplementation(() => {
        throw error
      })
      await expect(
        controller.create(PRODUCT_ID.TradeFinance, SUB_PRODUCT_ID.RiskCover, { ...mockData })
      ).rejects.toMatchObject(error)
    })
  })
})
