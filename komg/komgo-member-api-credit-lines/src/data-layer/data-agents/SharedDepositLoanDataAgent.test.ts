import {
  Currency,
  IRiskCoverData,
  IDepositLoan,
  DepositLoanPeriod,
  DepositLoanType,
  ISharedDepositLoan
} from '@komgo/types'
import 'reflect-metadata'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'

const sharedDepositLoanRepo = {
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

jest.mock('../mongodb/SharedDepositLoanRepo', () => ({
  SharedDepositLoanRepo: sharedDepositLoanRepo
}))

import SharedDepositLoanDataAgent from './SharedDepositLoanDataAgent'

const mockSharedDepositLoan: ISharedDepositLoan = {
  staticId: 'staticId',
  sharedWithStaticId: 'counterpartyStaticId',
  depositLoanStaticId: 'deposti-loan-static-id',
  appetite: { shared: true },
  pricing: { shared: true, pricing: 0.9 }
}

let dataAgent: SharedDepositLoanDataAgent
describe('SharedDepositLoanDataAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sharedDepositLoanRepo.find.mockReset()
    sharedDepositLoanRepo.create.mockReset()
    sharedDepositLoanRepo.findOne.mockReset()
    sharedDepositLoanRepo.delete.mockReset()
    sharedDepositLoanRepo.update.mockReset()
    sharedDepositLoanRepo.find.mockReset()
    sharedDepositLoanRepo.count.mockReset()
    sharedDepositLoanRepo.findOneAndUpdate.mockReset()
    sharedDepositLoanRepo.countDocuments.mockReset()
    sharedDepositLoanRepo.updateOne.mockReset()
    dataAgent = new SharedDepositLoanDataAgent()
  })

  describe('.find', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns shared deposit loans', async () => {
      sharedDepositLoanRepo.find.mockImplementation(() => [mockSharedDepositLoan])
      const depositLoans = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(depositLoans).toEqual([mockSharedDepositLoan])
    })
    it('Should throw a error data is invalid', async () => {
      sharedDepositLoanRepo.find.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return empty array', async () => {
      sharedDepositLoanRepo.find.mockImplementation(() => null)
      const result = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toEqual([])
    })
  })

  describe('.findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns shared deposit loans', async () => {
      sharedDepositLoanRepo.findOne.mockImplementation(() => mockSharedDepositLoan)
      const depositLoans = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(depositLoans).toEqual(mockSharedDepositLoan)
    })
    it('Should throw a error data is invalid', async () => {
      sharedDepositLoanRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return null', async () => {
      sharedDepositLoanRepo.findOne.mockImplementation(() => null)
      const result = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toBeNull()
    })
  })

  describe('.update', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns shared deposit loans', async () => {
      sharedDepositLoanRepo.updateOne.mockImplementation(() => {
        return { exec: jest.fn().mockImplementation(() => ({ n: 1, nModified: 1, ok: 1 })) }
      })
      sharedDepositLoanRepo.findOne.mockImplementation(() => mockSharedDepositLoan)
      const depositLoanResp = await dataAgent.update(mockSharedDepositLoan)
      expect(depositLoanResp).toEqual(mockSharedDepositLoan)
      expect(sharedDepositLoanRepo.updateOne).toBeCalledWith(
        expect.objectContaining({ staticId: mockSharedDepositLoan.staticId }),
        expect.anything(),
        expect.anything()
      )
    })

    it('Should throw a error - data not found', async () => {
      sharedDepositLoanRepo.updateOne.mockImplementation(() => {
        return { exec: jest.fn().mockImplementation(() => ({ n: 1, nModified: 1, ok: 1 })) }
      })
      sharedDepositLoanRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.update({ ...mockSharedDepositLoan, staticId: 'abc1' })
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
      sharedDepositLoanRepo.findOne.mockImplementation(() => mockSharedDepositLoan)
      const depositLoans = await dataAgent.get('staticId')
      expect(depositLoans).toEqual(mockSharedDepositLoan)
    })
    it('Should throw a error data is invalid', async () => {
      sharedDepositLoanRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.get('staticId')
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('missing data error', async () => {
      sharedDepositLoanRepo.findOne.mockImplementation(() => null)
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
    it('returns a shared deposit loans', async () => {
      sharedDepositLoanRepo.countDocuments.mockImplementation(() => 1)
      const numberOfdepositLoans = await dataAgent.count({})
      expect(numberOfdepositLoans).toEqual(1)
    })
    it('Should throw a error data is invalid', async () => {
      sharedDepositLoanRepo.countDocuments.mockImplementation(() => {
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
    it('Should delete shared deposit loan', async () => {
      sharedDepositLoanRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      sharedDepositLoanRepo.findOne.mockImplementation(() => {
        return {
          ...mockSharedDepositLoan,
          set: jest.fn(),
          save: jest.fn()
        }
      })
      expect(await dataAgent.delete('abc1')).toEqual(undefined)
    })
    it('Should throw a error - data not found', async () => {
      sharedDepositLoanRepo.findOne.mockImplementation(() => {
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
      sharedDepositLoanRepo.create.mockImplementation(() => {
        return {
          staticId: '123'
        }
      })
      await dataAgent.create(mockSharedDepositLoan)
      expect(sharedDepositLoanRepo.create).toHaveBeenCalled()
    })
    it('Should throw a error if the new data is invalid', async () => {
      sharedDepositLoanRepo.create.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.create(mockSharedDepositLoan)
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })
})
