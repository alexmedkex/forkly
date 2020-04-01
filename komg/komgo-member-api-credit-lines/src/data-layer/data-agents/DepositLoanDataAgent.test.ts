import { Currency, IRiskCoverData, IDepositLoan, DepositLoanPeriod, DepositLoanType } from '@komgo/types'
import 'reflect-metadata'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'

const depositLoanRepo = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  findOneAndUpdate: jest.fn(),
  countDocuments: jest.fn(),
  updateOne: jest.fn()
}

jest.mock('../mongodb/DepositLoanRepo', () => ({
  DepositLoanRepo: depositLoanRepo
}))

import DepositLoanDataAgent from './DepositLoanDataAgent'

const mockDepositLoan: IDepositLoan = {
  staticId: 'staticId',
  type: DepositLoanType.Loan,
  currency: Currency.USD,
  appetite: true,
  pricing: 0.9,
  period: DepositLoanPeriod.Months,
  periodDuration: 3,
  createdAt: new Date('2019-01-01').toISOString(),
  updatedAt: new Date('2019-01-01').toISOString()
}

let dataAgent: DepositLoanDataAgent
describe('DepositLoanDataAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    depositLoanRepo.find.mockReset()
    depositLoanRepo.create.mockReset()
    depositLoanRepo.findOne.mockReset()
    depositLoanRepo.delete.mockReset()
    depositLoanRepo.update.mockReset()
    depositLoanRepo.find.mockReset()
    depositLoanRepo.count.mockReset()
    depositLoanRepo.findOneAndUpdate.mockReset()
    depositLoanRepo.countDocuments.mockReset()
    depositLoanRepo.updateOne.mockReset()
    dataAgent = new DepositLoanDataAgent()
  })

  describe('.find', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns deposit loans', async () => {
      depositLoanRepo.find.mockImplementation(() => [mockDepositLoan])
      const depositLoans = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(depositLoans).toEqual([mockDepositLoan])
    })
    it('Should throw a error data is invalid', async () => {
      depositLoanRepo.find.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return empty array', async () => {
      depositLoanRepo.find.mockImplementation(() => null)
      const result = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toEqual([])
    })
  })

  describe('.findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns deposit loans', async () => {
      depositLoanRepo.findOne.mockImplementation(() => mockDepositLoan)
      const depositLoans = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(depositLoans).toEqual(mockDepositLoan)
    })
    it('Should throw a error data is invalid', async () => {
      depositLoanRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return null', async () => {
      depositLoanRepo.findOne.mockImplementation(() => null)
      const result = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toBeNull()
    })
  })

  describe('.update', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns deposit loans', async () => {
      depositLoanRepo.updateOne.mockImplementation(() => {
        return { exec: jest.fn().mockImplementation(() => ({ n: 1, nModified: 1, ok: 1 })) }
      })
      depositLoanRepo.findOne.mockImplementation(() => mockDepositLoan)
      const depositLoanResp = await dataAgent.update(mockDepositLoan)
      expect(depositLoanResp).toMatchObject(mockDepositLoan)
      expect(depositLoanRepo.updateOne).toBeCalledWith(
        expect.objectContaining({ staticId: mockDepositLoan.staticId }),
        expect.anything(),
        expect.anything()
      )
    })

    it('Should throw a error - data not found', async () => {
      depositLoanRepo.updateOne.mockImplementation(() => {
        return { exec: jest.fn().mockImplementation(() => ({ n: 1, nModified: 1, ok: 1 })) }
      })
      depositLoanRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.update({ ...mockDepositLoan, staticId: 'abc1' })
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingDepositLoanDataForStaticId, null)
      )
    })
  })

  describe('.get', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns deposit loan', async () => {
      depositLoanRepo.findOne.mockImplementation(() => mockDepositLoan)
      const depositLoans = await dataAgent.get('staticId')
      expect(depositLoans).toEqual(mockDepositLoan)
    })
    it('Should throw a error data is invalid', async () => {
      depositLoanRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.get('staticId')
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('missing data error', async () => {
      depositLoanRepo.findOne.mockImplementation(() => null)
      const result = dataAgent.get('staticId')
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingDepositLoanDataForStaticId, null)
      )
    })
  })

  describe('.count', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns a deposit loans', async () => {
      depositLoanRepo.countDocuments.mockImplementation(() => 1)
      const numberOfdepositLoans = await dataAgent.count({})
      expect(numberOfdepositLoans).toEqual(1)
    })
    it('Should throw a error data is invalid', async () => {
      depositLoanRepo.countDocuments.mockImplementation(() => {
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
    it('Should delete deposit loan', async () => {
      depositLoanRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      depositLoanRepo.findOne.mockImplementation(() => {
        return {
          ...mockDepositLoan,
          set: jest.fn(),
          save: jest.fn()
        }
      })
      expect(await dataAgent.delete('abc1')).toEqual(undefined)
    })
    it('Should throw a error - data not found', async () => {
      depositLoanRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.delete('abc1')
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingDepositLoanDataForStaticId, null)
      )
    })
  })

  describe('.create', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('create ', async () => {
      depositLoanRepo.create.mockImplementation(() => {
        return {
          staticId: '123'
        }
      })
      await dataAgent.create(mockDepositLoan)
      expect(depositLoanRepo.create).toHaveBeenCalled()
    })
    it('Should throw a error if the new data is invalid', async () => {
      depositLoanRepo.create.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.create(mockDepositLoan)
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })
})
