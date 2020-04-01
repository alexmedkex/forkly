import 'reflect-metadata'
// tslint:disable-next-line:no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import logger from '@komgo/logging'

jest.mock('@komgo/logging')

const axiosRetryMock = jest.fn()
const exponentialDelayMock = jest.fn()
// let axiosStatic: jest.Mocked<AxiosStatic>

const axiosStaticMock = {
  create: jest.fn(),
  Cancel: jest.fn(),
  CancelToken: jest.fn(),
  isCancel: jest.fn(),
  all: jest.fn(),
  spread: jest.fn(),
  get: jest.fn()
}
jest.mock('axios', () => ({
  axios: axiosStaticMock
}))

jest.mock('../../retry', () => ({
  axiosRetry: axiosRetryMock,
  exponentialDelay: exponentialDelayMock
}))

import { CompanyClient } from './CompanyClient'

let companyClient: CompanyClient

describe('CompanyClient', () => {
  beforeEach(() => {
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
      axiosRetryMock.mockImplementation(() => mockedResult)
      await companyClient.getCompanies({ name: '1111' })
      expect(axiosRetryMock).toHaveBeenCalledTimes(1)
    })

    it('returns Exception', done => {
      axiosRetryMock.mockImplementation(() => undefined)
      companyClient
        .getCompanies({ name: '1111' })
        .then(() => fail(`'it shouldn't succeed`))
        .catch(error => {
          // expect(error).toEqual({ message: "'source' has to be (KOMGO|VAKT)", status: 422, thrown: true })
          done()
        })
      // expect(axiosRetryMock).toHaveBeenCalledTimes(1)
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
      axiosRetryMock.mockImplementation(() => mockedResult)
      await companyClient.getCompanyByStaticId('1111')
      expect(axiosRetryMock).toHaveBeenCalledTimes(1)
    })

    it('return empty', async () => {
      const mockedResult = {
        data: null
      }
      axiosRetryMock.mockImplementation(() => mockedResult)
      const result = await companyClient.getCompanyByStaticId('1111')
      expect(axiosRetryMock).toHaveBeenCalledTimes(1)
      expect(result).toBe(null)
    })

    it('returns Exception', async () => {
      axiosRetryMock.mockImplementation(() => undefined)
      await expect(companyClient.getCompanyByStaticId('1111')).rejects.toThrow()
      // await companyClient
      //   .getCompanyByStaticId('1111')
      //   .then(() => fail(`'it shouldn't succeed`))
      //   .catch(error => {
      //     expect(error).toBeDefined()
      //     done()
      //   })
      // expect(axiosRetryMock).toHaveBeenCalledTimes(1)
    })
  })
})
