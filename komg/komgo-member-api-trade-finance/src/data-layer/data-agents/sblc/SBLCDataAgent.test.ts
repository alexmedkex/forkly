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

jest.mock('../../mongodb/sblc/SBLCRepo', () => ({
  SBLCRepo: mockRepo
}))

import { StandbyLetterOfCreditStatus, buildFakeStandByLetterOfCredit, IStandbyLetterOfCredit } from '@komgo/types'

import { SBLCDataAgent } from './SBLCDataAgent'

const staticId = 'fd0cf9da-b43b-41aa-a19e-f8ccd6b2bded'
const contractAddress = '0x01'

describe('SBLCDataAgent', () => {
  let dataAgent: SBLCDataAgent
  let sampleSBLC

  beforeEach(() => {
    sampleSBLC = { ...buildFakeStandByLetterOfCredit(), staticId }
    dataAgent = new SBLCDataAgent()
    jest.resetAllMocks()
  })

  it('is defined', () => {
    expect(dataAgent).toBeDefined()
  })

  describe('create', () => {
    it('should create an SBLC successfully', async () => {
      expect.assertions(2)
      mockRepo.create.mockImplementation(() => {
        return sampleSBLC
      })

      const staticIdResult = await dataAgent.save({
        ...sampleSBLC,
        status: StandbyLetterOfCreditStatus.Pending
      })

      expect(staticIdResult).toEqual(staticId)

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...sampleSBLC,
        status: StandbyLetterOfCreditStatus.Pending
      })
    })

    it('shouldn"t create an SBLC', async () => {
      const errorMessage = `invalid operation`
      const expectedMessage = `Failed to save the SBLC ${errorMessage}`
      mockRepo.create.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      await expect(
        dataAgent.save({
          ...sampleSBLC,
          status: StandbyLetterOfCreditStatus.Pending
        })
      ).rejects.toThrowError(new Error(expectedMessage))
    })
  })

  describe('get', () => {
    it('should get an sblc', async () => {
      expect.assertions(2)
      mockRepo.findOne.mockImplementation(() => {
        return Promise.resolve(sampleSBLC)
      })

      expect(await dataAgent.get(staticId)).toEqual(sampleSBLC)
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        staticId
      })
    })

    it('fail when trying to get an sblc', async () => {
      const errorMessage = `failed to get the sblc`
      const expectedMessage = `Failed to get the SBLC ${staticId} ${errorMessage}`

      mockRepo.findOne.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      await expect(dataAgent.get(staticId)).rejects.toThrowError(new Error(expectedMessage))
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('get by contract address', () => {
    it('should get an sblc by contract address', async () => {
      expect.assertions(2)
      const sblc = buildFakeStandByLetterOfCredit()
      mockRepo.findOne.mockImplementation(() => {
        return Promise.resolve(sblc)
      })

      expect(await dataAgent.getByContractAddress(contractAddress)).toEqual(sblc)
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        contractAddress
      })
    })

    it('fail when trying to get an sblc', async () => {
      const errorMessage = `failed to get the sblc`
      const expectedMessage = `Failed to get the SBLC ${contractAddress} ${errorMessage}`

      mockRepo.findOne.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      await expect(dataAgent.getByContractAddress(contractAddress)).rejects.toThrowError(new Error(expectedMessage))
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('find', () => {
    it('should return sblc', async () => {
      const skip = jest.fn().mockImplementation(() => ({ limit }))
      const limit = jest.fn().mockImplementation(() => ({ lean: () => Promise.resolve([]) }))

      mockRepo.find = jest.fn().mockImplementation(() => {
        return { skip }
      })
      await dataAgent.find({ filter: 'test-sblc' }, undefined, { skip: 10, limit: 200 })
      expect(mockRepo.find).toHaveBeenCalled()
      expect(skip).toHaveBeenCalledWith(10)
      expect(limit).toHaveBeenCalledWith(200)
    })
  })

  describe('count', () => {
    it('should return number of documents ', async () => {
      await dataAgent.count({ filter: 'test-sblc' })
      expect(mockRepo.countDocuments).toHaveBeenCalled()
    })
    it('should throw error on count', async () => {
      mockRepo.countDocuments.mockImplementation(() => {
        throw new Error('failed count')
      })
      await expect(dataAgent.count({ filter: 'test-sblc' })).rejects.toThrowError()
    })
  })

  describe('update', () => {
    it('should update correctly', async () => {
      const sblc = buildFakeStandByLetterOfCredit()
      mockRepo.findOneAndUpdate.mockImplementation(() => {
        return Promise.resolve(sblc)
      })

      await dataAgent.update('reference', sblc)
      expect(mockRepo.findOneAndUpdate).toBeCalledWith('reference', sblc, { upsert: true })
    })

    it('should fail when trying to update', async () => {
      const errorMessage = `failed to update the sblc`
      const expectedMessage = `failed to update SBLC ${errorMessage}`
      const sblc = buildFakeStandByLetterOfCredit()

      mockRepo.findOneAndUpdate.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      await expect(dataAgent.update('reference', sblc)).rejects.toThrowError(new Error(expectedMessage))
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })

  describe('get nonce', () => {
    it('should get the nonce of the sblc', async () => {
      expect.assertions(2)
      const sblc = buildFakeStandByLetterOfCredit({ nonce: 123 })
      mockRepo.findOne.mockImplementation(() => {
        return Promise.resolve(sblc)
      })

      expect(await dataAgent.getNonce(contractAddress)).toEqual(sblc.nonce)
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        contractAddress
      })
    })

    it('fail when trying to get the nonce of the sblc', async () => {
      const errorMessage = `failed to get the sblc nonce`
      const expectedMessage = `Failed to get the nonce of the SBLC ${contractAddress} ${errorMessage}`

      mockRepo.findOne.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      await expect(dataAgent.getNonce(contractAddress)).rejects.toBeDefined()
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })
})
