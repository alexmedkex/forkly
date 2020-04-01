import 'reflect-metadata'
import { TradeSource } from '@komgo/types'
import { ILCCacheDataAgent } from './ILCCacheDataAgent'
import { ILC } from '../../models/ILC'
import { trade, cargo } from '../../../business-layer/messaging/mock-data/mock-lc'

const txHash = '0x123'

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findByIdAndUpdate: jest.fn()
}

jest.mock('../../mongodb/LCRepo', () => ({
  LCRepo: mockRepo
}))

jest.mock('mongoose', () => ({
  startSession: jest.fn().mockImplementation(() => mockSession)
}))

const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn()
}

const LC: ILC = {
  issuingBankId: 'bank',
  applicantId: 'buyer',
  beneficiaryId: 'seller',
  tradeAndCargoSnapshot: {
    source: TradeSource.Vakt,
    sourceId: 'V123',
    trade,
    cargo: cargo[0]
  },
  direct: true,
  beneficiaryBankId: '',
  cargoIds: [''],
  type: '',
  applicableRules: '',
  feesPayableBy: '',
  currency: '',
  amount: 1,
  expiryDate: '',
  expiryPlace: '',
  availableWith: '',
  availableBy: '',
  documentPresentationDeadlineDays: 1,
  reference: '',
  transactionHash: '',
  status: '',
  billOfLadingEndorsement: ''
}

const genericError = new Error('test')

import { LCCacheDataAgent } from './LCCacheDataAgent'
import { LC_STATE } from '../../../business-layer/events/LC/LCStates'

const entity = {
  _id: '123'
}

describe('LCCacheDataAgent', () => {
  let agent: ILCCacheDataAgent

  beforeEach(() => {
    agent = new LCCacheDataAgent()
  })

  describe('SaveLC', () => {
    it('should call create if no LC exists', async () => {
      mockRepo.create.mockImplementation(() => entity)
      const result = await agent.saveLC(LC)

      expect(mockRepo.create).toHaveBeenCalledTimes(1)
      expect(result).toEqual(entity._id)
    })

    it('should throw if saveLC fails', async () => {
      mockRepo.create.mockImplementation(() => {
        throw genericError
      })
      await expect(agent.saveLC(LC)).rejects.toBeDefined()
    })

    it('should call findOneAndUpdate on LC with id', async () => {
      mockRepo.findOneAndUpdate.mockImplementationOnce(() => entity)
      const lc = { ...LC, _id: '1234' }

      const result = await agent.saveLC(lc)

      expect(mockRepo.findOneAndUpdate).toHaveBeenCalledTimes(1)
      expect(result).toEqual(entity._id)
    })
  })

  describe('GetLC', () => {
    it('should return an LC', async () => {
      mockRepo.findOne.mockImplementation(() => {
        return {
          contractAddress: txHash
        }
      })
      const result = await agent.getLC({ contractAddress: txHash })
      expect(result).toEqual({ contractAddress: txHash })
    })
    it('should throw if findOne fails', async () => {
      mockRepo.findOne.mockImplementation(() => {
        throw genericError
      })
      await expect(agent.getLC(LC)).rejects.toBeDefined()
    })
  })

  describe('GetLCs', () => {
    it('should return all LCs', async () => {
      mockRepo.find.mockImplementation(() => {
        return LC
      })

      const result = await agent.getLCs()

      expect(result).toEqual(LC)
    })

    it('should crash when trying to get all LCs', async () => {
      mockRepo.find.mockImplementation(() => {
        throw new Error('test')
      })

      await expect(agent.getLCs()).rejects.toBeDefined()
    })
  })

  describe('UpdateLcByReference', () => {
    it('should call the update lc by reference', async () => {
      const reference = 'reference'
      mockRepo.findOneAndUpdate.mockImplementation(() => {
        return LC
      })

      await agent.updateLcByReference(reference, LC)
      expect(mockRepo.findOneAndUpdate).toBeCalledWith({ reference }, LC, { upsert: true })
    })

    it('should throw a error if the updateLcByReference failed', async () => {
      mockRepo.findOneAndUpdate.mockImplementation(() => {
        throw Error('Not found LC by reference')
      })

      const result = agent.updateLcByReference('reference', LC)
      await expect(result).rejects.toEqual(Error('Not found LC by reference'))
    })
  })

  describe('Update status', () => {
    it('should call the update status', async () => {
      mockRepo.findOne.mockImplementation(() => {
        return LC
      })

      mockRepo.create.mockImplementation(() => {
        return LC
      })

      const result = await agent.updateStatus('123', LC_STATE.ACKNOWLEDGED, '123')
      expect(mockRepo.findOne).toBeCalledWith({ _id: '123' })
      expect(mockRepo.create).toBeCalledWith(LC)
    })

    it('should throw a error if the update status failed', async () => {
      mockRepo.findOne.mockImplementation(() => {
        throw new Error(`Failed to update status for LC with id`)
      })

      const result = agent.updateStatus('123', LC_STATE.ACKNOWLEDGED, '123')
      await expect(result).rejects.toBeDefined()
    })
  })

  describe('Update field', () => {
    it('should call the update field', async () => {
      mockRepo.findByIdAndUpdate.mockImplementation(() => {
        return LC
      })

      const reference = 'reference'
      const result = await agent.updateField('123', reference, '123')
      expect(mockRepo.findByIdAndUpdate).toBeCalledWith('123', { $set: { reference: '123' } })
    })

    it('should throw a error if the update field failed', async () => {
      mockRepo.findByIdAndUpdate.mockImplementation(() => {
        throw new Error(`Failed to update LC with id`)
      })

      const reference = 'reference'
      const result = agent.updateField('123', reference, '123')
      await expect(result).rejects.toBeDefined()
    })
  })
})
