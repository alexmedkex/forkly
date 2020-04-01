import { Currency, IRiskCoverData, IDisclosedDepositLoan, DepositLoanPeriod, DepositLoanType } from '@komgo/types'
import 'reflect-metadata'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'

const disclosedDepositLoanRepo = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  findOneAndUpdate: jest.fn(),
  countDocuments: jest.fn(),
  updateOne: jest.fn(),
  aggregate: jest.fn()
}

jest.mock('../mongodb/DisclosedDepositLoanRepo', () => ({
  DisclosedDepositLoanRepo: disclosedDepositLoanRepo
}))

import DisclosedDepositLoanDataAgent from './DisclosedDepositLoanDataAgent'

const mockDepositLoan: IDisclosedDepositLoan = {
  ownerStaticId: 'companyStaticId',
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

let dataAgent: DisclosedDepositLoanDataAgent
describe('DisclosedDepositLoanDataAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    disclosedDepositLoanRepo.find.mockReset()
    disclosedDepositLoanRepo.create.mockReset()
    disclosedDepositLoanRepo.findOne.mockReset()
    disclosedDepositLoanRepo.delete.mockReset()
    disclosedDepositLoanRepo.update.mockReset()
    disclosedDepositLoanRepo.find.mockReset()
    disclosedDepositLoanRepo.count.mockReset()
    disclosedDepositLoanRepo.findOneAndUpdate.mockReset()
    disclosedDepositLoanRepo.countDocuments.mockReset()
    disclosedDepositLoanRepo.updateOne.mockReset()
    dataAgent = new DisclosedDepositLoanDataAgent()
  })

  describe('.find', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns deposit loans', async () => {
      disclosedDepositLoanRepo.find.mockImplementation(() => [mockDepositLoan])
      const depositLoans = await dataAgent.find(
        DepositLoanType.Loan,
        { staticId: 'staticId' },
        {},
        { skip: 0, limit: 1000 }
      )
      expect(disclosedDepositLoanRepo.find).toBeCalledWith(
        { staticId: 'staticId', type: DepositLoanType.Loan, deletedAt: null },
        expect.anything(),
        expect.anything()
      )
      expect(depositLoans).toEqual([mockDepositLoan])
    })
    it('Should throw a error data is invalid', async () => {
      disclosedDepositLoanRepo.find.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.find(DepositLoanType.Loan, { staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return empty array', async () => {
      disclosedDepositLoanRepo.find.mockImplementation(() => null)
      const result = await dataAgent.find(DepositLoanType.Loan, { staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toEqual([])
    })
  })

  describe('.findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns deposit loans', async () => {
      disclosedDepositLoanRepo.findOne.mockImplementation(() => mockDepositLoan)
      const depositLoans = await dataAgent.findOne(
        DepositLoanType.Loan,
        { staticId: 'staticId' },
        {},
        { skip: 0, limit: 1000 }
      )
      expect(depositLoans).toEqual(mockDepositLoan)
    })
    it('Should throw a error data is invalid', async () => {
      disclosedDepositLoanRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.findOne(DepositLoanType.Loan, { staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return null', async () => {
      disclosedDepositLoanRepo.findOne.mockImplementation(() => null)
      const result = await dataAgent.findOne(
        DepositLoanType.Loan,
        { staticId: 'staticId' },
        {},
        { skip: 0, limit: 1000 }
      )
      await expect(result).toBeNull()
    })
  })

  describe('.update', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns deposit loans', async () => {
      disclosedDepositLoanRepo.updateOne.mockImplementation(() => {
        return { exec: jest.fn().mockImplementation(() => ({ n: 1, nModified: 1, ok: 1 })) }
      })

      disclosedDepositLoanRepo.findOne.mockImplementation(() => mockDepositLoan)
      const depositLoanResp = await dataAgent.update(mockDepositLoan)
      expect(depositLoanResp).toEqual(mockDepositLoan)
      expect(disclosedDepositLoanRepo.updateOne).toBeCalledWith(
        expect.objectContaining({ staticId: mockDepositLoan.staticId }),
        expect.anything(),
        expect.anything()
      )
    })

    it('Should throw a error - data not found', async () => {
      disclosedDepositLoanRepo.updateOne.mockImplementation(() => {
        return { exec: jest.fn().mockImplementation(() => ({ n: 1, nModified: 1, ok: 1 })) }
      })
      disclosedDepositLoanRepo.findOne.mockImplementation(() => {
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
      disclosedDepositLoanRepo.findOne.mockImplementation(() => mockDepositLoan)
      const depositLoans = await dataAgent.get('staticId')
      expect(depositLoans).toEqual(mockDepositLoan)
    })
    it('Should throw a error data is invalid', async () => {
      disclosedDepositLoanRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.get('staticId')
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('missing data error', async () => {
      disclosedDepositLoanRepo.findOne.mockImplementation(() => null)
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
      disclosedDepositLoanRepo.countDocuments.mockImplementation(() => 1)
      const numberOfdepositLoans = await dataAgent.count(DepositLoanType.Loan, {})
      expect(disclosedDepositLoanRepo.countDocuments).toBeCalledWith({ type: DepositLoanType.Loan, deletedAt: null })
      expect(numberOfdepositLoans).toEqual(1)
    })
    it('Should throw a error data is invalid', async () => {
      disclosedDepositLoanRepo.countDocuments.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.count(DepositLoanType.Loan, {})
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })

  describe('.delete', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('Should delete deposit loan', async () => {
      disclosedDepositLoanRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      disclosedDepositLoanRepo.findOne.mockImplementation(() => {
        return {
          ...mockDepositLoan,
          set: jest.fn(),
          save: jest.fn()
        }
      })
      expect(await dataAgent.delete('abc1')).toEqual(undefined)
    })
    it('Should throw a error - data not found', async () => {
      disclosedDepositLoanRepo.findOne.mockImplementation(() => {
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
      disclosedDepositLoanRepo.create.mockImplementation(() => {
        return {
          staticId: '123'
        }
      })
      await dataAgent.create(mockDepositLoan)
      expect(disclosedDepositLoanRepo.create).toHaveBeenCalled()
    })
    it('Should throw a error if the new data is invalid', async () => {
      disclosedDepositLoanRepo.create.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.create(mockDepositLoan)
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
          type: DepositLoanType.Loan,
          currency: Currency.EUR,
          period: DepositLoanPeriod.Months,
          periodDuration: 1,
          lowestPricing: 1,
          appetiteCount: 3,
          lastUpdated: new Date('2019-01-01').toISOString()
        }
      ]
      disclosedDepositLoanRepo.aggregate.mockImplementation(() => {
        return aggregateResult
      })
      const result = await dataAgent.disclosedSummary(DepositLoanType.Loan, {})
      expect(result).toEqual(aggregateResult)
      expect(disclosedDepositLoanRepo.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: { type: DepositLoanType.Loan, deletedAt: null }
          })
        ])
      )
    })

    it('Should throw a error if the new data is invalid', async () => {
      disclosedDepositLoanRepo.aggregate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.disclosedSummary(DepositLoanType.Loan, {})
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })
})
