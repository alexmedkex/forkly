import 'reflect-metadata'
import { IRegistryEventManagerDAO } from '../dao/IRegistryEventManagerDAO'

const repoMock = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
  deleteMany: jest.fn()
}

jest.mock('./RegistryEventProcessedRepository', () => ({
  EventProcessedRepo: repoMock
}))

jest.mock('mongoose', () => ({
  startSession: jest.fn().mockImplementation(() => sessionMock)
}))

const sessionMock = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn()
}

import { RegistryEventManagerDAOMongo } from './RegistryEventManagerDAOMongo'

describe('Test RegistryEventManagerDAOMongo', () => {
  let dao: IRegistryEventManagerDAO

  beforeEach(() => {
    dao = new RegistryEventManagerDAOMongo()
  })

  describe('Get last event processed', () => {
    it('get last event', async () => {
      await dao.getLastEventProcessed()
      expect(repoMock.findOne).toHaveBeenCalledTimes(1)
    })
  })

  describe('Save event processed', () => {
    it('save event', async () => {
      await dao.createOrUpdate(12345, '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 0)
      expect(repoMock.findOneAndUpdate).toHaveBeenCalledTimes(1)
    })

    it('Does not save event if it has been saved already', async () => {
      repoMock.findOneAndUpdate.mockResolvedValue({})
      await dao.createOrUpdate(12345, '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 0)

      expect(repoMock.findOneAndUpdate).toHaveBeenCalledTimes(1)
    })
  })

  it('save event', async () => {
    await dao.clearAll()
    expect(repoMock.deleteMany).toHaveBeenCalledTimes(1)
  })
})
