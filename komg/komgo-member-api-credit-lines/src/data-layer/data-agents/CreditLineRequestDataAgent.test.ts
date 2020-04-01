import { ICreditLine, Currency, CreditLineRequestType, CreditLineRequestStatus } from '@komgo/types'
import 'reflect-metadata'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { ICreditLineRequestDocument } from '../models/ICreditLineRequestDocument'

const creditLineRequestRepo = {
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

jest.mock('../mongodb/CreditLineRequestRepo', () => ({
  CreditLineRequestRepo: creditLineRequestRepo
}))

import CreditLineRequestDataAgent from './CreditLineRequestDataAgent'

const mockCreditLineRequest: ICreditLineRequestDocument = {
  staticId: 'staticId',
  counterpartyStaticId: 'counterpartyStaticId',
  companyStaticId: 'companyId',
  context: { productId: 'productId', subProductId: 'subProductId' },
  comment: 'test-comment',
  requestType: CreditLineRequestType.Requested,
  createdAt: new Date('2019-01-01'),
  updatedAt: new Date('2019-01-01')
}

let dataAgent: CreditLineRequestDataAgent
describe('CreditLineRequestDataAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    creditLineRequestRepo.find.mockReset()
    creditLineRequestRepo.create.mockReset()
    creditLineRequestRepo.findOne.mockReset()
    creditLineRequestRepo.delete.mockReset()
    creditLineRequestRepo.update.mockReset()
    creditLineRequestRepo.find.mockReset()
    creditLineRequestRepo.count.mockReset()
    creditLineRequestRepo.findOneAndUpdate.mockReset()
    creditLineRequestRepo.countDocuments.mockReset()
    creditLineRequestRepo.aggregate.mockReset()
    dataAgent = new CreditLineRequestDataAgent()
  })

  describe('.find', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns credit line requests', async () => {
      creditLineRequestRepo.find.mockImplementation(() => [mockCreditLineRequest])
      const creditLines = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(creditLines).toEqual([mockCreditLineRequest])
    })

    it('Should throw a error data is invalid', async () => {
      creditLineRequestRepo.find.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })

    it('Should return empty array', async () => {
      creditLineRequestRepo.find.mockImplementation(() => null)
      const result = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toEqual([])
    })
  })

  describe('.findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns credit lines requests', async () => {
      creditLineRequestRepo.findOne.mockImplementation(() => mockCreditLineRequest)
      const creditLines = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(creditLines).toEqual(mockCreditLineRequest)
    })
    it('Should throw a error data is invalid', async () => {
      creditLineRequestRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return null', async () => {
      creditLineRequestRepo.findOne.mockImplementation(() => null)
      const result = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toBeNull()
    })
  })

  describe('.update', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns disclosed credit lines', async () => {
      const creditLineRequestWithOperator = {
        ...mockCreditLineRequest,
        set: jest.fn(),
        save: jest.fn()
      }
      creditLineRequestRepo.findOne.mockImplementation(() => creditLineRequestWithOperator)
      const creditLineResp = await dataAgent.update(mockCreditLineRequest)
      expect(creditLineResp).toEqual(creditLineRequestWithOperator)
    })
    it('Should throw a error - data not found', async () => {
      creditLineRequestRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.update({ ...mockCreditLineRequest, staticId: 'abc1' })
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingCreditLineRequestForStaticId, null)
      )
    })
  })

  describe('.get', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns credit line request', async () => {
      creditLineRequestRepo.findOne.mockImplementation(() => mockCreditLineRequest)
      const creditLines = await dataAgent.get('staticId')
      expect(creditLines).toEqual(mockCreditLineRequest)
    })

    it('Should throw a error data is invalid', async () => {
      creditLineRequestRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.get('staticId')
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })

    it('missing data error', async () => {
      creditLineRequestRepo.findOne.mockImplementation(() => null)
      const result = dataAgent.get('staticId')
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingCreditLineRequestForStaticId, null)
      )
    })
  })

  describe('.count', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('returns a credit line requests', async () => {
      creditLineRequestRepo.countDocuments.mockImplementation(() => 1)
      const numberOfCreditLines = await dataAgent.count({})
      expect(numberOfCreditLines).toEqual(1)
    })

    it('Should throw a error data is invalid', async () => {
      creditLineRequestRepo.countDocuments.mockImplementation(() => {
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

    it('Should delete credit line requests', async () => {
      creditLineRequestRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      creditLineRequestRepo.findOne.mockImplementation(() => {
        return {
          ...mockCreditLineRequest,
          set: jest.fn(),
          save: jest.fn()
        }
      })
      expect(await dataAgent.delete('abc1')).toEqual(undefined)
    })

    it('Should throw a error - data not found', async () => {
      creditLineRequestRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.delete('abc1')
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingCreditLineRequestForStaticId, null)
      )
    })
  })

  describe('.create', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('create ', async () => {
      creditLineRequestRepo.create.mockImplementation(() => {
        return {
          staticId: '123'
        }
      })
      await dataAgent.create(mockCreditLineRequest)
      expect(creditLineRequestRepo.create).toHaveBeenCalled()
    })

    it('Should throw a error if the new data is invalid', async () => {
      creditLineRequestRepo.create.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.create(mockCreditLineRequest)
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })
})
