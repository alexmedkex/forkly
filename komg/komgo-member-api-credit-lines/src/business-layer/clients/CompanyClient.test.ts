import logger from '@komgo/logging'
import mockAxios from 'axios'
import 'reflect-metadata'

// jest.mock('@komgo/logging')

jest.mock('../../retry', () => ({
  ...require.requireActual('../../retry'),
  exponentialDelay: (delay: number) => {
    return (retryNum: number) => {
      return 0
    }
  }
}))

import { CompanyClient } from './CompanyClient'

let companyClient: CompanyClient

describe('CompanyClient', () => {
  beforeEach(() => {
    mockAxios.post = jest.fn()
    mockAxios.create = jest.fn()
    mockAxios.get = jest.fn()
    companyClient = new CompanyClient('test', 1000)
  })

  describe('getCompanies', () => {
    it('get companies', async () => {
      const mockedResult = {
        data: [
          {
            guid: '1111',
            komgoMnid: '2222',
            vaktMnid: '3333',
            x500Name: '44444',
            address: '555666',
            text: undefined
          }
        ]
      }
      mockAxios.get = jest.fn().mockImplementation(() => mockedResult)
      await companyClient.getCompanies({ name: '1111' })
      expect(mockAxios.get).toHaveBeenCalledTimes(1)
    })

    it('returns Exception', async done => {
      mockAxios.get = jest.fn().mockImplementation(() => undefined)
      await companyClient
        .getCompanies({ name: '1111' })
        .then(() => fail(`'it shouldn't succeed`))
        .catch(error => {
          done()
        })
    })
  })

  describe('getByStaticId', () => {
    it('return by static id', async () => {
      const mockedResult = {
        data: [
          {
            guid: '1111',
            komgoMnid: '2222',
            vaktMnid: '3333',
            x500Name: '44444',
            address: '555666',
            text: undefined
          }
        ]
      }
      mockAxios.get = jest.fn().mockImplementation(() => mockedResult)
      await companyClient.getCompanyByStaticId('1111')
      expect(mockAxios.get).toHaveBeenCalledTimes(1)
    })

    it('return empty', async () => {
      const mockedResult = {
        data: null
      }
      mockAxios.get = jest.fn().mockImplementation(() => mockedResult)
      const result = await companyClient.getCompanyByStaticId('1111')
      expect(mockAxios.get).toHaveBeenCalledTimes(1)
      expect(result).toBe(null)
    })

    it('returns Exception', async () => {
      mockAxios.get = jest.fn().mockImplementation(() => undefined)
      await expect(companyClient.getCompanyByStaticId('1111')).rejects.toThrow()
    })
  })
})
