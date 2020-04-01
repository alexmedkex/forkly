import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { RequestIdHandler } from '../../util/RequestIdHandler'
import { CompanyRegistryError } from '../errors'

import { CompanyRegistryClient } from './CompanyRegistryClient'

const API_REGISTRY_DOMAIN = 'http://api-registry'

describe('CompanyRegistryClient', () => {
  let dataAgent: CompanyRegistryClient
  let mockRequestIdHandler: jest.Mocked<RequestIdHandler>
  let axiosMock: MockAdapter

  beforeAll(() => {
    axiosMock = new MockAdapter(Axios)
  })

  beforeEach(() => {
    mockRequestIdHandler = createMockInstance(RequestIdHandler)

    dataAgent = new CompanyRegistryClient(API_REGISTRY_DOMAIN, mockRequestIdHandler)
  })

  describe('config', () => {
    it('should configure axios successfully', async () => {
      expect(mockRequestIdHandler.addToAxios).toHaveBeenCalled()
    })
  })

  describe('getContractAddress', () => {
    it('should get a contract address successfully', async () => {
      const expectedAddress = '0xaddress'
      const expectedData = [
        {
          address: expectedAddress
        }
      ]

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      const address = await dataAgent.getContractAddress('node')
      expect(address).toEqual(expectedAddress)
    })

    it('should throw an error if no data is returned', async () => {
      const expectedData = null

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      await expect(dataAgent.getContractAddress('domain')).rejects.toThrowError(CompanyRegistryError)
    })

    it('should throw an error if data returned is empty', async () => {
      const expectedData = []

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      await expect(dataAgent.getContractAddress('domain')).rejects.toThrowError(CompanyRegistryError)
    })

    it('should throw an error if data returned does not contain an address field', async () => {
      const expectedData = [
        {
          address: undefined
        }
      ]

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      await expect(dataAgent.getContractAddress('domain')).rejects.toThrowError(CompanyRegistryError)
    })
  })
})
