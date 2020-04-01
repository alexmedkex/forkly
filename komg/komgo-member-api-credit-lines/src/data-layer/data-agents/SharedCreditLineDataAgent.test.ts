import { ISharedCreditLine, IInformationShared } from '@komgo/types'
import 'reflect-metadata'

const sharedCreditLineRepo = {
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

jest.mock('../mongodb/SharedCreditLineRepo', () => ({
  SharedCreditLineRepo: sharedCreditLineRepo
}))

import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'

import SharedCreditLineDataAgent from './SharedCreditLineDataAgent'
import { ErrorName } from '../../utils/Constants'

const mockSharedCreditLine: ISharedCreditLine<IInformationShared> = {
  staticId: 'staticId',
  counterpartyStaticId: 'counterpartyStaticId',
  sharedWithStaticId: 'sharedWithStaticId',
  creditLineStaticId: 'creditLineStaticId',
  data: null
}

let dataAgent: SharedCreditLineDataAgent
describe('SharedCreditLineDataAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sharedCreditLineRepo.find.mockReset()
    sharedCreditLineRepo.create.mockReset()
    sharedCreditLineRepo.findOne.mockReset()
    sharedCreditLineRepo.delete.mockReset()
    sharedCreditLineRepo.update.mockReset()
    sharedCreditLineRepo.find.mockReset()
    sharedCreditLineRepo.count.mockReset()
    sharedCreditLineRepo.findOneAndUpdate.mockReset()
    sharedCreditLineRepo.countDocuments.mockReset()
    dataAgent = new SharedCreditLineDataAgent()
  })

  describe('.find', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns credit lines', async () => {
      sharedCreditLineRepo.find.mockImplementation(() => [mockSharedCreditLine])
      const creditLines = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      expect(creditLines).toEqual([mockSharedCreditLine])
    })
    it('Should throw a error data is invalid', async () => {
      sharedCreditLineRepo.find.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('Should return empty array', async () => {
      sharedCreditLineRepo.find.mockImplementation(() => null)
      const result = await dataAgent.find({ staticId: 'staticId' }, {}, { skip: 0, limit: 1000 })
      await expect(result).toEqual([])
    })
  })

  describe('.get', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('returns credit line', async () => {
      sharedCreditLineRepo.findOne.mockImplementation(() => mockSharedCreditLine)
      const creditLines = await dataAgent.get('staticId')
      expect(creditLines).toEqual(mockSharedCreditLine)
    })
    it('Should throw a error data is invalid', async () => {
      sharedCreditLineRepo.findOne.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.get('staticId')
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
    it('missing data error', async () => {
      sharedCreditLineRepo.findOne.mockImplementation(() => null)
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
      sharedCreditLineRepo.countDocuments.mockImplementation(() => 1)
      const numberOfCreditLines = await dataAgent.count({})
      expect(numberOfCreditLines).toEqual(1)
    })
    it('Should throw a error data is invalid', async () => {
      sharedCreditLineRepo.countDocuments.mockImplementation(() => {
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
    it('returns void', done => {
      return dataAgent
        .delete('abc1')
        .then(() => done())
        .catch(e => done(e))
    })
    it('Should throw a error data is invalid', async () => {
      sharedCreditLineRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.delete('abc1')
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })

  describe('.create', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('create ', async () => {
      sharedCreditLineRepo.create.mockImplementation(() => {
        return {
          staticId: '123'
        }
      })
      await dataAgent.create(mockSharedCreditLine)
      expect(sharedCreditLineRepo.create).toHaveBeenCalled()
    })
    it('Should throw a error if the new data is invalid', async () => {
      sharedCreditLineRepo.create.mockImplementation(() => {
        throw new Error('Invalid data')
      })
      const result = dataAgent.create(mockSharedCreditLine)
      await expect(result).rejects.toEqual(new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Invalid data'))
    })
  })

  describe('.update', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('update', async () => {
      const mockSharedCreditLineWithOperator = {
        ...mockSharedCreditLine,
        set: jest.fn(),
        save: jest.fn()
      }
      sharedCreditLineRepo.findOne.mockImplementation(() => mockSharedCreditLineWithOperator)
      const sharedCreditLineResp = await dataAgent.update(mockSharedCreditLine)
      expect(sharedCreditLineResp).toMatchObject(mockSharedCreditLine)
    })
    it('Should throw a error - data not found', async () => {
      sharedCreditLineRepo.findOne.mockImplementation(() => {
        return null
      })
      const result = dataAgent.update({ ...mockSharedCreditLine, staticId: '1234' })
      await expect(result).rejects.toEqual(
        new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingCreditLineDataForStaticId, null)
      )
    })
  })
})
