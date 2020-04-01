import 'reflect-metadata'

const mockRepo = {
  create: jest.fn(),
  delete: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOne: jest.fn(),
  get: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn()
}

jest.mock('uuid', () => ({
  v4: () => staticId
}))

jest.mock('../../mongodb/letter-of-credit/LetterOfCreditRepo', () => ({
  LetterOfCreditRepo: mockRepo
}))

import { LetterOfCreditStatus, buildFakeLetterOfCredit } from '@komgo/types'

import { LetterOfCreditDataAgent } from './LetterOfCreditDataAgent'
import { DatabaseConnectionException } from '../../../exceptions'

const staticId = 'fd0cf9da-b43b-41aa-a19e-f8ccd6b2bded'
const contractAddress = '0x01'

describe('LetterOfCreditDataAgent', () => {
  let dataAgent: LetterOfCreditDataAgent
  let sampleLetterOfCredit

  beforeEach(() => {
    sampleLetterOfCredit = buildFakeLetterOfCredit({ staticId })
    dataAgent = new LetterOfCreditDataAgent()
    jest.resetAllMocks()
  })

  it('is defined', () => {
    expect(dataAgent).toBeDefined()
  })

  describe('create', () => {
    it('should create a letter of credit successfully', async () => {
      expect.assertions(2)
      mockRepo.create.mockImplementation(() => {
        return {
          toObject: () => sampleLetterOfCredit
        }
      })

      const staticIdResult = await dataAgent.save({
        ...sampleLetterOfCredit,
        status: LetterOfCreditStatus.Pending
      })

      expect(staticIdResult).toEqual(sampleLetterOfCredit.staticId)

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...sampleLetterOfCredit,
        status: LetterOfCreditStatus.Pending
      })
    })

    it("shouldn't create a letter of credit", async () => {
      mockRepo.create.mockImplementation(() => {
        throw new Error('fail')
      })

      await expect(
        dataAgent.save({
          ...sampleLetterOfCredit,
          status: LetterOfCreditStatus.Pending
        })
      ).rejects.toBeInstanceOf(DatabaseConnectionException)
    })
  })

  describe('get', () => {
    it('should get a letter of credit', async () => {
      expect.assertions(2)
      mockRepo.findOne.mockImplementation(() => {
        return {
          toObject: () => sampleLetterOfCredit
        }
      })

      expect(await dataAgent.get(staticId)).toEqual(sampleLetterOfCredit)
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        staticId
      })
    })

    it('fail when trying to get a letter of credit', async () => {
      mockRepo.findOne.mockImplementation(() => {
        throw new Error('fail')
      })

      await expect(dataAgent.get(staticId)).rejects.toBeInstanceOf(DatabaseConnectionException)
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('get by contract address', () => {
    it('should get a letter of credit by contract address', async () => {
      expect.assertions(2)
      const letterOfCredit = buildFakeLetterOfCredit()
      mockRepo.findOne.mockImplementation(() => {
        return {
          toObject: () => letterOfCredit
        }
      })

      expect(await dataAgent.getByContractAddress(contractAddress)).toEqual(letterOfCredit)
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        contractAddress
      })
    })

    it('fail when trying to get a letter of credit', async () => {
      mockRepo.findOne.mockImplementation(() => {
        throw new Error('fail')
      })

      await expect(dataAgent.getByContractAddress(contractAddress)).rejects.toBeInstanceOf(DatabaseConnectionException)
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('find', () => {
    it('should return letter of credit', async () => {
      const skip = jest.fn().mockImplementation(() => ({ limit }))
      const limit = jest.fn().mockImplementation(() => ({
        lean: () => {
          toObject: () => []
        }
      }))

      mockRepo.find = jest.fn().mockImplementation(() => {
        return {
          skip
        }
      })
      await dataAgent.find({ filter: 'test-letter-of-credit' }, undefined, { skip: 10, limit: 200 })
      expect(mockRepo.find).toHaveBeenCalled()
      expect(skip).toHaveBeenCalledWith(10)
      expect(limit).toHaveBeenCalledWith(200)
    })
  })

  describe('count', () => {
    it('should return number of documents ', async () => {
      await dataAgent.count({ filter: 'test-letter-of-credit' })
      expect(mockRepo.countDocuments).toHaveBeenCalled()
    })
    it('should throw error on count', async () => {
      mockRepo.countDocuments.mockImplementation(() => {
        throw new Error('failed count')
      })
      await expect(dataAgent.count({ filter: 'test-letter-of-credit' })).rejects.toThrowError()
    })
  })

  describe('update', () => {
    it('should update correctly', async () => {
      const letterOfCredit = buildFakeLetterOfCredit()
      mockRepo.findOneAndUpdate.mockImplementation(() => {
        return {
          toObject: () => letterOfCredit
        }
      })

      await dataAgent.update('reference', letterOfCredit)
      expect(mockRepo.findOneAndUpdate).toBeCalledWith('reference', letterOfCredit, { upsert: true })
    })

    it('should fail when trying to update', async () => {
      const letterOfCredit = buildFakeLetterOfCredit()

      mockRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error('fail')
      })

      await expect(dataAgent.update('reference', letterOfCredit)).rejects.toBeInstanceOf(DatabaseConnectionException)
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('get nonce', () => {
    it('should get the nonce of the letter of credit', async () => {
      expect.assertions(2)
      const letterOfCredit = buildFakeLetterOfCredit({ nonce: 123 })
      mockRepo.findOne.mockImplementation(() => {
        return {
          toObject: () => letterOfCredit
        }
      })

      expect(await dataAgent.getNonce(contractAddress)).toEqual(letterOfCredit.nonce)
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        contractAddress
      })
    })

    it('fail when trying to get the nonce of the sblc', async () => {
      mockRepo.findOne.mockImplementation(() => {
        throw new Error('fail')
      })

      await expect(dataAgent.getNonce(contractAddress)).rejects.toBeDefined()
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })
})
