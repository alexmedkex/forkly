import { ICreditLine, Currency } from '@komgo/types'
import 'reflect-metadata'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { IDisclosedCreditLine } from '../models/IDisclosedCreditLine'

const disclosedCreditLineRepo = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  findOneAndUpdate: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn()
}

jest.mock('../mongodb/DisclosedCreditLineRepo', () => ({
  DisclosedCreditLineRepo: disclosedCreditLineRepo
}))

import DisclosedCreditLineDataAgent from './DisclosedCreditLineDataAgent'

const mockDisclosedCreditLine: IDisclosedCreditLine = {
  staticId: 'staticId',
  ownerStaticId: 'ownerStaticId',
  counterpartyStaticId: 'counterpartyStaticId',
  currency: Currency.USD,
  context: { productId: 'productId', subProductId: 'subProductId' },
  appetite: true,
  creditLimit: null,
  availability: false,
  availabilityAmount: null,
  data: null,
  createdAt: new Date('2019-01-01').toISOString(),
  updatedAt: new Date('2019-01-01').toISOString()
}

let dataAgent: DisclosedCreditLineDataAgent
describe('DisclosedCreditLineDataAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    disclosedCreditLineRepo.find.mockReset()
    disclosedCreditLineRepo.create.mockReset()
    disclosedCreditLineRepo.findOne.mockReset()
    disclosedCreditLineRepo.delete.mockReset()
    disclosedCreditLineRepo.update.mockReset()
    disclosedCreditLineRepo.find.mockReset()
    disclosedCreditLineRepo.count.mockReset()
    disclosedCreditLineRepo.findOneAndUpdate.mockReset()
    disclosedCreditLineRepo.countDocuments.mockReset()
    disclosedCreditLineRepo.aggregate.mockReset()
    dataAgent = new DisclosedCreditLineDataAgent()
  })

  describe('.find', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns disclosed disclosed credit lines', async () => {
      disclosedCreditLineRepo.find.mockImplementation(() => [mockDisclosedCreditLine])
      const creditLines = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(creditLines).toEqual([mockDisclosedCreditLine])
    })

    it('Should throw a error data is invalid', async () => {
      disclosedCreditLineRepo.find.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })

    it('Should return empty array', async () => {
      disclosedCreditLineRepo.find.mockImplementation(() => null)
      const result = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toEqual([])
    })
  })

  describe('.findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns disclosed credit lines', async () => {
      disclosedCreditLineRepo.findOne.mockImplementation(() => mockDisclosedCreditLine)
      const creditLines = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(creditLines).toEqual(mockDisclosedCreditLine)
    })
    it('Should throw a error data is invalid', async () => {
      disclosedCreditLineRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return null', async () => {
      disclosedCreditLineRepo.findOne.mockImplementation(() => null)
      const result = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toBeNull()
    })
  })

  describe('.update', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns disclosed credit lines', async () => {
      const mockDisclosedCreditLineWithOperator = {
        ...mockDisclosedCreditLine,
        set: jest.fn(),
        save: jest.fn()
      }
      disclosedCreditLineRepo.findOne.mockImplementation(() => mockDisclosedCreditLineWithOperator)
      const creditLineResp = await dataAgent.update(mockDisclosedCreditLine)
      expect(creditLineResp).toEqual(mockDisclosedCreditLineWithOperator)
    })
    it('Should throw a error - data not found', async () => {
      disclosedCreditLineRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.update({ ...mockDisclosedCreditLine, staticId: 'abc1' })
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingDisclosedCreditLineDataForStaticId, null)
      )
    })
  })

  describe('.get', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns disclosed credit line', async () => {
      disclosedCreditLineRepo.findOne.mockImplementation(() => mockDisclosedCreditLine)
      const creditLines = await dataAgent.get('staticId')
      expect(creditLines).toEqual(mockDisclosedCreditLine)
    })

    it('Should throw a error data is invalid', async () => {
      disclosedCreditLineRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.get('staticId')
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })

    it('missing data error', async () => {
      disclosedCreditLineRepo.findOne.mockImplementation(() => null)
      const result = dataAgent.get('staticId')
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingDisclosedCreditLineDataForStaticId, null)
      )
    })
  })

  describe('.count', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('returns a disclosed credit lines', async () => {
      disclosedCreditLineRepo.countDocuments.mockImplementation(() => 1)
      const numberOfCreditLines = await dataAgent.count({})
      expect(numberOfCreditLines).toEqual(1)
    })

    it('Should throw a error data is invalid', async () => {
      disclosedCreditLineRepo.countDocuments.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.count({})
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })

  describe('.delete', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('Should delete disclosed credit line', async () => {
      disclosedCreditLineRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      disclosedCreditLineRepo.findOne.mockImplementation(() => {
        return {
          ...mockDisclosedCreditLine,
          set: jest.fn(),
          save: jest.fn()
        }
      })
      expect(await dataAgent.delete('abc1')).toEqual(undefined)
    })

    it('Should throw a error - data not found', async () => {
      disclosedCreditLineRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.delete('abc1')
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingDisclosedCreditLineDataForStaticId, null)
      )
    })
  })

  describe('.create', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('create ', async () => {
      disclosedCreditLineRepo.create.mockImplementation(() => {
        return {
          staticId: '123'
        }
      })
      await dataAgent.create(mockDisclosedCreditLine)
      expect(disclosedCreditLineRepo.create).toHaveBeenCalled()
    })

    it('Should throw a error if the new data is invalid', async () => {
      disclosedCreditLineRepo.create.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.create(mockDisclosedCreditLine)
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })

  describe('.disclosedSummary', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('Should return aggregate query', async () => {
      const aggregateResult = [
        {
          counterpartyStaticId: 'test-id-1',
          lowestRiskFee: 10,
          availabilityCount: 1,
          appetiteCount: 2
        }
      ]
      disclosedCreditLineRepo.aggregate.mockImplementation(() => {
        return aggregateResult
      })
      const result = await dataAgent.disclosedSummary(
        { productId: 'productId' },
        { counterpartyStaticId: 'test-static-id' }
      )
      expect(result).toEqual(aggregateResult)
      expect(disclosedCreditLineRepo.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: { counterpartyStaticId: 'test-static-id', context: { productId: 'productId' } }
          })
        ])
      )
    })

    it('Should throw a error if the new data is invalid', async () => {
      disclosedCreditLineRepo.aggregate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.disclosedSummary({ productId: '1' })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })
})
