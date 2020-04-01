// tslint:disable-next-line:no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

let companyCoverageRepo: jest.Mocked<CompanyCoverageModel>
companyCoverageRepo = {
  find: jest.fn(),
  updateOne: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  hasOwnMetadata: jest.fn()
}
let dataAgent: CompanyCoverageDataAgent
jest.mock('../models/CompanyCoverage', () => ({
  CompanyCoverage: companyCoverageRepo
}))

import { CompanyCoverageDataAgent } from './CompanyCoverageDataAgent'
import { CompanyCoverageModel } from '../models/CompanyCoverage'
import { STATUSES } from '../constants/Status'
import { HttpException, ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'
import { DataAccessException } from '../exceptions/DataAccessException'

describe('CompanyCoverageDataAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // companyCoverageRepo.findOne = jest.fn()
    // companyCoverageRepo.create = jest.fn()
    dataAgent = new CompanyCoverageDataAgent()
  })

  describe('.create', () => {
    it('create', async () => {
      companyCoverageRepo.findOne.mockImplementation(() => undefined)
      await dataAgent.create({
        companyId: '1111',
        coverageRequestId: 'aaaa',
        status: STATUSES.PENDING
      })
      expect(companyCoverageRepo.findOne).toHaveBeenCalledTimes(1)
      expect(companyCoverageRepo.create).toHaveBeenCalledTimes(1)
    })

    it('throw error company covered', async () => {
      companyCoverageRepo.findOne.mockImplementation(() => ({ id: 1, companyId: '1111' }))
      await expect(
        dataAgent.create({
          companyId: '1111',
          coverageRequestId: 'aaaa',
          status: STATUSES.PENDING
        })
      ).rejects.toBeInstanceOf(DataAccessException)
    })

    it('throw error request null', async () => {
      companyCoverageRepo.findOne.mockImplementation(() => undefined)
      await expect(
        dataAgent.create({
          companyId: '1111',
          coverageRequestId: null,
          status: STATUSES.COMPLETED
        })
      ).rejects.toBeInstanceOf(DataAccessException)
    })

    it('create and assign requestId', async () => {
      companyCoverageRepo.findOne.mockImplementation(() => undefined)
      companyCoverageRepo.create.mockImplementation(() => ({ _id: '2222' }))
      await dataAgent.create({
        companyId: '1111',
        coverageRequestId: null,
        status: STATUSES.PENDING
      })

      expect(companyCoverageRepo.findOne).toHaveBeenCalledTimes(1)
      expect(companyCoverageRepo.create).toHaveBeenCalledTimes(1)
      expect(companyCoverageRepo.updateOne).toHaveBeenCalledTimes(1)
    })
  })

  describe('.update', () => {
    it('update data', async () => {
      const mockedResult = {
        set: jest.fn(),
        save: jest.fn()
      }
      companyCoverageRepo.findOne.mockImplementation(() => mockedResult)
      await dataAgent.update('1111', { covered: false, status: STATUSES.COMPLETED })
      expect(companyCoverageRepo.findOne).toHaveBeenCalledWith({ coverageRequestId: '1111' })
      expect(mockedResult.set).toHaveBeenCalledTimes(1)
      expect(mockedResult.save).toHaveBeenCalledTimes(1)
    })

    it('throw exception', async () => {
      companyCoverageRepo.findOne.mockImplementation(() => undefined)
      await expect(dataAgent.update('1111', { covered: false, status: STATUSES.COMPLETED })).rejects.toBeInstanceOf(
        DataAccessException
      )
    })

    it('throw exception - company id missmatch', async () => {
      const mockedResult = {
        set: jest.fn(),
        save: jest.fn(),
        companyId: 'bbbbb'
      }
      companyCoverageRepo.findOne.mockImplementation(() => mockedResult)
      await expect(
        dataAgent.update('1111', { companyId: 'aaaa', covered: false, status: STATUSES.COMPLETED })
      ).rejects.toBeInstanceOf(DataAccessException)
    })
  })

  describe('.delete', () => {
    it('delete data', async () => {
      const mockedResult = {
        remove: jest.fn()
      }
      companyCoverageRepo.findOne.mockImplementation(() => mockedResult)
      await dataAgent.delete('1111')
      expect(companyCoverageRepo.findOne).toHaveBeenCalledWith({ coverageRequestId: '1111' })
      expect(mockedResult.remove).toHaveBeenCalledTimes(1)
    })

    it('delete throw error', async () => {
      companyCoverageRepo.findOne.mockImplementation(() => undefined)
      await expect(dataAgent.delete('1111')).rejects.toBeInstanceOf(DataAccessException)
    })
  })

  describe('.get', () => {
    it('get data', async () => {
      const mockedResult = {
        remove: jest.fn()
      }
      companyCoverageRepo.findOne.mockImplementation(() => mockedResult)
      await dataAgent.get('1111')
      expect(companyCoverageRepo.findOne).toHaveBeenCalledWith({ companyId: '1111' })
    })
  })

  describe('.findByCompanyIds', () => {
    it('base filter', async () => {
      const mockedResult = {
        remove: jest.fn()
      }
      companyCoverageRepo.findOne.mockImplementation(() => mockedResult)
      await dataAgent.findByCompanyIds(['1111'])
      expect(companyCoverageRepo.find).toHaveBeenCalledWith({ companyId: { $in: ['1111'] } })
    })

    it('additional filter', async () => {
      const mockedResult = {
        remove: jest.fn()
      }
      companyCoverageRepo.findOne.mockImplementation(() => mockedResult)
      await dataAgent.findByCompanyIds(['1111'], { coverageRequestId: '123' })
      expect(companyCoverageRepo.find).toHaveBeenCalledWith({ companyId: { $in: ['1111'] }, coverageRequestId: '123' })
    })
  })

  describe('.find', () => {
    it('find', async () => {
      await dataAgent.find({ coverageRequestId: '123' })
      expect(companyCoverageRepo.find).toHaveBeenCalledWith({ coverageRequestId: '123' })
    })
  })

  describe('.findOne', () => {
    it('findOne', async () => {
      await dataAgent.findOne({ coverageRequestId: '123' })
      expect(companyCoverageRepo.findOne).toHaveBeenCalledWith({ coverageRequestId: '123' })
    })
  })
})
