import {
  Currency,
  DepositLoanPeriod,
  DepositLoanType,
  DepositLoanRequestType,
  DepositLoanRequestStatus
} from '@komgo/types'
import 'reflect-metadata'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { IDepositLoanRequestDocument } from '../models/IDepositLoanRequestDocument'

const depositLoanRequestRepo = {
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

jest.mock('../mongodb/DepositLoanRequestRepo', () => ({
  DepositLoanRequestRepo: depositLoanRequestRepo
}))

import DepositLoanRequestDataAgent from './DepositLoanRequestDataAgent'

const mockDepositLoanRequest: IDepositLoanRequestDocument = {
  staticId: 'staticId',
  currency: Currency.AED,
  period: DepositLoanPeriod.Days,
  periodDuration: 1,
  companyStaticId: 'companyId',
  comment: 'test-comment',
  requestType: DepositLoanRequestType.Requested,
  type: DepositLoanType.Deposit,
  status: DepositLoanRequestStatus.Pending,
  createdAt: new Date('2019-01-01'),
  updatedAt: new Date('2019-01-01')
}

let dataAgent: DepositLoanRequestDataAgent
describe('DepositLoanRequestDataAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    depositLoanRequestRepo.find.mockReset()
    depositLoanRequestRepo.create.mockReset()
    depositLoanRequestRepo.findOne.mockReset()
    depositLoanRequestRepo.delete.mockReset()
    depositLoanRequestRepo.update.mockReset()
    depositLoanRequestRepo.find.mockReset()
    depositLoanRequestRepo.count.mockReset()
    depositLoanRequestRepo.findOneAndUpdate.mockReset()
    depositLoanRequestRepo.countDocuments.mockReset()
    depositLoanRequestRepo.aggregate.mockReset()
    dataAgent = new DepositLoanRequestDataAgent()
  })

  describe('.find', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns depositloan requests', async () => {
      depositLoanRequestRepo.find.mockImplementation(() => [mockDepositLoanRequest])
      const depositLoans = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(depositLoans).toEqual([mockDepositLoanRequest])
    })

    it('Should throw a error data is invalid', async () => {
      depositLoanRequestRepo.find.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })

    it('Should return empty array', async () => {
      depositLoanRequestRepo.find.mockImplementation(() => null)
      const result = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toEqual([])
    })
  })

  describe('.findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns credit lines requests', async () => {
      depositLoanRequestRepo.findOne.mockImplementation(() => mockDepositLoanRequest)
      const depositLoans = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(depositLoans).toEqual(mockDepositLoanRequest)
    })
    it('Should throw a error data is invalid', async () => {
      depositLoanRequestRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return null', async () => {
      depositLoanRequestRepo.findOne.mockImplementation(() => null)
      const result = await dataAgent.findOne({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toBeNull()
    })
  })

  describe('.update', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns disclosed credit lines', async () => {
      const depositLoanRequestWithOperator = {
        ...mockDepositLoanRequest,
        set: jest.fn(),
        save: jest.fn()
      }
      depositLoanRequestRepo.findOne.mockImplementation(() => depositLoanRequestWithOperator)
      const depositLoanResp = await dataAgent.update(mockDepositLoanRequest)
      expect(depositLoanResp).toEqual(depositLoanRequestWithOperator)
    })
    it('Should throw a error - data not found', async () => {
      depositLoanRequestRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.update({ ...mockDepositLoanRequest, staticId: 'abc1' })
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingDepositLoanRequestDataForStaticId, null)
      )
    })
  })

  describe('.get', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns deposit-loan request', async () => {
      depositLoanRequestRepo.findOne.mockImplementation(() => ({
        ...mockDepositLoanRequest,
        type: DepositLoanType.Deposit
      }))
      const depositLoans = await dataAgent.get(DepositLoanType.Deposit, 'staticId')
      expect(depositLoans).toEqual({ ...mockDepositLoanRequest, type: DepositLoanType.Deposit })
    })

    it('Should throw a error data is invalid', async () => {
      depositLoanRequestRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.get(DepositLoanType.Deposit, 'staticId')
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })

    it('missing data error', async () => {
      depositLoanRequestRepo.findOne.mockImplementation(() => null)
      const result = dataAgent.get(DepositLoanType.Deposit, 'staticId')
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingDepositLoanRequestDataForStaticId, null)
      )
    })
  })

  describe('.count', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('returns a depositLoans requests', async () => {
      depositLoanRequestRepo.countDocuments.mockImplementation(() => 1)
      const numberOfDepositLoans = await dataAgent.count({})
      expect(numberOfDepositLoans).toEqual(1)
    })

    it('Should throw a error data is invalid', async () => {
      depositLoanRequestRepo.countDocuments.mockImplementation(() => {
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
      depositLoanRequestRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      depositLoanRequestRepo.findOne.mockImplementation(() => {
        return {
          ...mockDepositLoanRequest,
          set: jest.fn(),
          save: jest.fn()
        }
      })
      expect(await dataAgent.delete('abc1')).toEqual(undefined)
    })

    it('Should throw a error - data not found', async () => {
      depositLoanRequestRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.delete('abc1')
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingDepositLoanRequestDataForStaticId, null)
      )
    })
  })

  describe('.create', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('create ', async () => {
      depositLoanRequestRepo.create.mockImplementation(() => {
        return {
          staticId: '123'
        }
      })
      await dataAgent.create(mockDepositLoanRequest)
      expect(depositLoanRequestRepo.create).toHaveBeenCalled()
    })

    it('Should throw a error if the new data is invalid', async () => {
      depositLoanRequestRepo.create.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.create(mockDepositLoanRequest)
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })
})
