import { Currency, ICreditLineSaveRequest } from '@komgo/types'

import { IDisclosedCreditLineDataAgent } from '../../data-layer/data-agents/IDisclosedCreditLineDataAgent'
import { IDisclosedCreditLineSummary } from '../../data-layer/models/IDisclosedCreditLineSummary'

import { DisclosedCreditLineController } from './DisclosedCreditLineController'

interface IDisclosedCreditLineRequest extends ICreditLineSaveRequest {
  ownerStaticId: string
}

let dataAgent: IDisclosedCreditLineDataAgent
let controller: DisclosedCreditLineController

const mockData: IDisclosedCreditLineRequest = {
  // staticId: 'test-static-id',
  ownerStaticId: 'ownerStaticId',
  counterpartyStaticId: '111222333',
  context: {
    productId: '1',
    subProductId: '2'
  },
  appetite: true,
  currency: Currency.USD,
  creditLimit: 100,
  availability: false,
  availabilityAmount: 100,
  data: {},
  sharedCreditLines: []
}

const mockSummary: IDisclosedCreditLineSummary = {
  counterpartyStaticId: '111222333',
  lowestRiskFee: 10,
  availabilityCount: 10,
  appetiteCount: 20
}

describe('DisclosedCreditLineController', () => {
  beforeEach(() => {
    dataAgent = {
      create: jest.fn(),
      findOne: jest.fn(),
      get: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      disclosedSummary: jest.fn()
    }

    controller = new DisclosedCreditLineController(dataAgent)
  })

  describe('.find', () => {
    it('returns disclosed credit lines', async () => {
      const filter = {}
      const query = JSON.stringify(filter)
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      expect(await controller.find('productId', 'subProductId', query)).toEqual([mockData])
    })

    it('returns disclosed credit lines with query string', async () => {
      const filter = {
        something: 'something'
      }
      const query = JSON.stringify(filter)
      dataAgent.find = jest.fn().mockReturnValue([mockData])
      await expect(controller.find('productId', 'subProductId', query)).rejects.toBeDefined()
    })

    it('retrow error', async () => {
      dataAgent.find = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(controller.find('productId', 'subProductId')).rejects.toMatchObject({ error: 'error' })
    })
  })

  describe('.getById', () => {
    it('returns disclosed credit line', async () => {
      dataAgent.get = jest.fn().mockReturnValue(mockData)
      expect(await controller.getById('id')).toEqual(mockData)
    })

    it('retrow error', async () => {
      dataAgent.get = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(controller.getById('id')).rejects.toMatchObject({ error: 'error' })
    })
  })

  describe('.getByProduct', () => {
    it('returns disclosed credit line', async () => {
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

  describe('.getSummaryByProduct', () => {
    it('returns summary', async () => {
      dataAgent.disclosedSummary = jest.fn().mockReturnValue([mockSummary])
      expect(await controller.getSummaryByProduct('productId', 'subProductId')).toEqual([mockSummary])
      expect(dataAgent.disclosedSummary).toBeCalledWith({ productId: 'productId', subProductId: 'subProductId' })
    })

    it('retrow error', async () => {
      dataAgent.disclosedSummary = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(controller.getSummaryByProduct('productId', 'subProductId')).rejects.toMatchObject({
        error: 'error'
      })
    })
  })

  describe('.disclosedSummary', () => {
    it('returns summary', async () => {
      const context = JSON.stringify({ productId: 'productId' })
      dataAgent.disclosedSummary = jest.fn().mockReturnValue([mockSummary])
      expect(await controller.getSummary('productId', 'subProductId', context, undefined)).toEqual([mockSummary])
      expect(dataAgent.disclosedSummary).toBeCalledWith(
        { productId: 'productId', subProductId: 'subProductId' },
        { context: { productId: 'productId', subProductId: 'subProductId' } }
      )
    })

    it('returns summary with filter', async () => {
      const context = JSON.stringify({ productId: 'productId' })
      const filter = JSON.stringify({ something: 'something' })
      dataAgent.disclosedSummary = jest.fn().mockReturnValue([mockSummary])
      expect(await controller.getSummary('productId', 'subProductId', context, filter)).toEqual([mockSummary])
      expect(dataAgent.disclosedSummary).toBeCalledWith(
        { productId: 'productId', subProductId: 'subProductId' },
        { context: { productId: 'productId', subProductId: 'subProductId' }, something: 'something' }
      )
    })

    it('retrow error', async () => {
      const context = JSON.stringify({ productId: 'productId' })
      dataAgent.disclosedSummary = jest.fn().mockReturnValueOnce(Promise.reject({ error: 'error' }))
      await expect(controller.getSummary('productId', 'subProductId', context, undefined)).rejects.toMatchObject({
        error: 'error'
      })
    })
  })
})
