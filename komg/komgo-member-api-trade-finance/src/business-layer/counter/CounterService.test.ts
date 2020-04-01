import 'reflect-metadata'

import { ReferenceType } from '@komgo/types'
import { ICounterDataAgent } from '../../data-layer/data-agents'
import { ICounterService } from './ICounterService'
import { CounterService } from './CounterService'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'

const getMemberMock = jest.fn()

const mockRegistryService: ICompanyRegistryService = {
  getMember: getMemberMock,
  getNodeKeys: jest.fn(),
  getMembersByNode: jest.fn(),
  getMembers: jest.fn()
}

const getCounterAndUpdateMock = jest.fn()
const mockCounterDataAgent: ICounterDataAgent = {
  getCounterAndUpdate: getCounterAndUpdateMock
}

describe('CounterService', () => {
  let counterService: ICounterService

  beforeAll(() => {
    counterService = new CounterService(mockRegistryService, mockCounterDataAgent)
  })

  describe('calculateNewReferenceId', () => {
    it('should return the correct reference ID', async () => {
      getCounterAndUpdateMock.mockImplementation(() => 1)
      getMemberMock.mockImplementation(() => {
        return {
          data: [
            {
              x500Name: {
                CN: 'mercuria'
              }
            }
          ]
        }
      })
      const result = await counterService.calculateNewReferenceId(ReferenceType.LC, '1')
      expect(result).toEqual('LC-MER-19-1')
    })
    it('should throw a exception', async () => {
      getMemberMock.mockImplementation(() => {
        return null
      })
      const result = counterService.calculateNewReferenceId(ReferenceType.LC, '1')
      await expect(result).rejects.toBeDefined()
    })
  })

  describe('calculateNewReferenceObject', () => {
    it('should return the correct reference object', async () => {
      getCounterAndUpdateMock.mockImplementation(() => 1)
      getMemberMock.mockImplementation(() => {
        return {
          data: [
            {
              x500Name: {
                CN: 'mercuria'
              }
            }
          ]
        }
      })
      const result = await counterService.calculateNewReferenceObject(ReferenceType.LC, '1')
      expect(result).toEqual({ trigram: 'MER', value: 1, year: 19 })
    })

    it('should throw a exception', async () => {
      getMemberMock.mockImplementation(() => {
        return null
      })
      const result = counterService.calculateNewReferenceObject(ReferenceType.LC, '1')
      await expect(result).rejects.toBeDefined()
    })
  })
})
