import { ICreditLine, Currency, IRiskCoverData } from '@komgo/types'
import 'reflect-metadata'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'

const creditLineRepo = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  findOneAndUpdate: jest.fn(),
  countDocuments: jest.fn()
}

jest.mock('../mongodb/CreditLineRepo', () => ({
  CreditLineRepo: creditLineRepo
}))

import CreditLineDataAgent from './CreditLineDataAgent'

const mockCreditLine: ICreditLine = {
  staticId: 'staticId',
  counterpartyStaticId: 'counterpartyStaticId',
  currency: Currency.USD,
  context: { productId: 'productId', subProductId: 'subProductId' },
  appetite: true,
  creditLimit: null,
  availability: false,
  availabilityAmount: null,
  data: {},
  createdAt: new Date('2019-01-01').toISOString(),
  updatedAt: new Date('2019-01-01').toISOString()
}

let dataAgent: CreditLineDataAgent
describe('CreditLineDataAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    creditLineRepo.find.mockReset()
    creditLineRepo.create.mockReset()
    creditLineRepo.findOne.mockReset()
    creditLineRepo.delete.mockReset()
    creditLineRepo.update.mockReset()
    creditLineRepo.find.mockReset()
    creditLineRepo.count.mockReset()
    creditLineRepo.findOneAndUpdate.mockReset()
    creditLineRepo.countDocuments.mockReset()
    dataAgent = new CreditLineDataAgent()
  })

  describe('.find', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns credit lines', async () => {
      creditLineRepo.find.mockImplementation(() => [mockCreditLine])
      const creditLines = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(creditLines).toEqual([mockCreditLine])
    })
    it('Should throw a error data is invalid', async () => {
      creditLineRepo.find.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return empty array', async () => {
      creditLineRepo.find.mockImplementation(() => null)
      const result = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toEqual([])
    })
  })

  describe('.findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns credit lines', async () => {
      creditLineRepo.findOne.mockImplementation(() => mockCreditLine)
      const creditLines = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(creditLines).toEqual(mockCreditLine)
    })
    it('Should throw a error data is invalid', async () => {
      creditLineRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return null', async () => {
      creditLineRepo.findOne.mockImplementation(() => null)
      const result = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toBeNull()
    })
  })

  describe('.update', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns credit lines', async () => {
      const mockCreditLineWithOperator = {
        ...mockCreditLine,
        set: jest.fn(),
        save: jest.fn()
      }
      creditLineRepo.findOne.mockImplementation(() => mockCreditLineWithOperator)
      const creditLineResp = await dataAgent.update(mockCreditLine)
      expect(creditLineResp).toEqual(mockCreditLineWithOperator)
    })
    it('Should update availabilityAmount', async () => {
      const mockCreditLineWithOperator = {
        ...mockCreditLine,
        set: jest.fn(),
        save: jest.fn()
      }
      creditLineRepo.findOne.mockImplementation(() => mockCreditLineWithOperator)
      mockCreditLine.availabilityAmount = 25
      const creditLineResp = await dataAgent.update(mockCreditLine)
      expect(creditLineResp).toEqual(mockCreditLineWithOperator)
      expect(creditLineResp.availabilityAmountUpdatedAt).not.toBeNull()
    })
    it('Should update availabilityReserved', async () => {
      const mockRiskCoverData: IRiskCoverData = {
        fee: 25,
        maximumTenor: 25,
        availabilityReserved: 1222340
      }
      const mockCreditLineWithOperator = {
        ...mockCreditLine,
        set: jest.fn(),
        save: jest.fn()
      }

      creditLineRepo.findOne.mockImplementation(() => mockCreditLineWithOperator)
      const updateCreditLine = {
        ...mockCreditLine,
        data: mockRiskCoverData
      }
      const creditLineResp = await dataAgent.update(updateCreditLine)
      expect(mockCreditLineWithOperator.set).toBeCalled()
      expect(mockCreditLineWithOperator.save).toBeCalled()
    })
    it('Should update availabilityReserved - risk cover data not exists', async () => {
      const mockRiskCoverData: IRiskCoverData = {
        fee: 25,
        maximumTenor: 25,
        availabilityReserved: 1222340
      }
      const mockCreditLineWithOperator = {
        ...mockCreditLine,
        data: null,
        set: jest.fn(),
        save: jest.fn()
      }

      creditLineRepo.findOne.mockImplementation(() => mockCreditLineWithOperator)
      const updateCreditLine = {
        ...mockCreditLine,
        data: mockRiskCoverData
      }
      const creditLineResp = await dataAgent.update(updateCreditLine)
      expect(mockCreditLineWithOperator.set).toBeCalled()
      expect(mockCreditLineWithOperator.save).toBeCalled()
    })
    it('Should throw a error - data not found', async () => {
      creditLineRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.update({ ...mockCreditLine, staticId: 'abc1' })
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingCreditLineDataForStaticId, null)
      )
    })
  })

  describe('.get', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns credit line', async () => {
      creditLineRepo.findOne.mockImplementation(() => mockCreditLine)
      const creditLines = await dataAgent.get('staticId')
      expect(creditLines).toEqual(mockCreditLine)
    })
    it('Should throw a error data is invalid', async () => {
      creditLineRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.get('staticId')
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('missing data error', async () => {
      creditLineRepo.findOne.mockImplementation(() => null)
      const result = dataAgent.get('staticId')
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingCreditLineDataForStaticId, null)
      )
    })
  })

  describe('.count', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns a credit lines', async () => {
      creditLineRepo.countDocuments.mockImplementation(() => 1)
      const numberOfCreditLines = await dataAgent.count({})
      expect(numberOfCreditLines).toEqual(1)
    })
    it('Should throw a error data is invalid', async () => {
      creditLineRepo.countDocuments.mockImplementation(() => {
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
    it('Should delete credit line', async () => {
      creditLineRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      creditLineRepo.findOne.mockImplementation(() => {
        return {
          ...mockCreditLine,
          set: jest.fn(),
          save: jest.fn()
        }
      })
      expect(await dataAgent.delete('abc1')).toEqual(undefined)
    })
    it('Should throw a error - data not found', async () => {
      creditLineRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.delete('abc1')
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingCreditLineDataForStaticId, null)
      )
    })
  })

  describe('.create', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('create ', async () => {
      creditLineRepo.create.mockImplementation(() => {
        return {
          staticId: '123'
        }
      })
      await dataAgent.create(mockCreditLine)
      expect(creditLineRepo.create).toHaveBeenCalled()
    })
    it('Should throw a error if the new data is invalid', async () => {
      creditLineRepo.create.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.create(mockCreditLine)
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })
})
