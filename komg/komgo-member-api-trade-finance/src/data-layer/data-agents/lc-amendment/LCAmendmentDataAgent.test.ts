import 'reflect-metadata'
const staticId = 'fd0cf9da-b43b-41aa-a19e-f8ccd6b2bded'
jest.mock('uuid', () => ({
  v4: () => staticId
}))
const mockRepo = {
  create: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  get: jest.fn(),
  count: jest.fn()
}

jest.mock('../../mongodb/LCAmendmentRepo', () => ({
  LCAmendmentRepo: mockRepo
}))

import { LCAmendmentStatus, buildFakeAmendment } from '@komgo/types'
import { LCAmendmentDataAgent } from './LCAmendmentDataAgent'
import { DatabaseConnectionException } from '../../../exceptions'

const mockAmendment = buildFakeAmendment({
  staticId,
  diffs: [
    {
      op: 'replace',
      path: '/maxTolerance',
      value: 3,
      oldValue: 1,
      type: 'ITrade'
    }
  ]
})

describe('LCAmendmentDataAgent', () => {
  let dataAgent: LCAmendmentDataAgent

  beforeEach(() => {
    dataAgent = new LCAmendmentDataAgent()
    jest.resetAllMocks()
  })

  it('is defined', () => {
    expect(dataAgent).toBeDefined()
  })

  describe('create', () => {
    it('success', async () => {
      expect.assertions(2)
      mockRepo.create.mockImplementation(() => {
        return {
          staticId
        }
      })
      expect(
        await dataAgent.create({
          ...mockAmendment,
          status: LCAmendmentStatus.Pending
        })
      ).toEqual(staticId)
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...mockAmendment,
        status: LCAmendmentStatus.Pending,
        staticId
      })
    })
  })

  describe('get', () => {
    it('success', async () => {
      expect.assertions(2)
      const amendment = buildFakeAmendment()
      mockRepo.findOne.mockImplementation(() => {
        return Promise.resolve(amendment)
      })
      expect(await dataAgent.get(staticId)).toEqual(amendment)
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        staticId
      })
    })

    it('failure', async () => {
      const error = new Error('Boom!')
      mockRepo.findOne.mockImplementation(() => {
        return Promise.reject(error)
      })
      await expect(dataAgent.get(staticId)).rejects.toBeInstanceOf(DatabaseConnectionException)
      expect(mockRepo.create).not.toHaveBeenCalled()
    })
  })
})
