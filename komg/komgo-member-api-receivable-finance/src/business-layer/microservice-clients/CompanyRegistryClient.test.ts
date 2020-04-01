import Axios, { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'reflect-metadata'

import { createRetryingAxios } from '../../utils/axiosRetryFactory'
import { MicroserviceClientError } from '../errors'

import { CompanyRegistryClient } from './CompanyRegistryClient'

const API_REGISTRY_DOMAIN = 'http://api-registry'
const STATIC_ID_0 = 'staticId0'
const STATIC_ID_1 = 'staticId1'

describe('CompanyRegistryClient', () => {
  let dataAgent: CompanyRegistryClient
  let axiosMock: MockAdapter
  let axiosInstance: AxiosInstance

  beforeAll(() => {
    axiosMock = new MockAdapter(Axios)
    axiosInstance = createRetryingAxios(0)
  })

  beforeEach(() => {
    dataAgent = new CompanyRegistryClient(API_REGISTRY_DOMAIN, axiosInstance)
  })

  describe('getAllMembersStaticIds', () => {
    it('should get a contract address successfully', async () => {
      const expectedData = [
        {
          staticId: STATIC_ID_0
        },
        {
          staticId: STATIC_ID_1
        }
      ]

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      const memberStaticIds = await dataAgent.getAllMembersStaticIds()

      expect(memberStaticIds).toEqual([STATIC_ID_0, STATIC_ID_1])
    })

    it('should throw an error if no data is returned', async () => {
      const expectedData = null

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      await expect(dataAgent.getAllMembersStaticIds()).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if data returned is empty', async () => {
      const expectedData = []

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      await expect(dataAgent.getAllMembersStaticIds()).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if the request fails', async () => {
      axiosMock.onGet(/api-registry.*/).networkErrorOnce(500)

      await expect(dataAgent.getAllMembersStaticIds()).rejects.toThrowError(MicroserviceClientError)
    })
  })

  describe('getCompanyNameFromStaticId', () => {
    it('should get a member entry successfully', async () => {
      const expectedData = [
        {
          x500Name: {
            O: 'Company Name'
          }
        }
      ]
      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      const entry = await dataAgent.getCompanyNameFromStaticId(STATIC_ID_0)

      expect(entry).toEqual('Company Name')
    })

    it('should throw an error if no data is returned', async () => {
      const expectedData = null

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      await expect(dataAgent.getCompanyNameFromStaticId(STATIC_ID_0)).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if data returned is empty', async () => {
      const expectedData = []

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      await expect(dataAgent.getCompanyNameFromStaticId(STATIC_ID_0)).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if the request fails', async () => {
      axiosMock.onGet(/api-registry.*/).networkErrorOnce(500)

      await expect(dataAgent.getCompanyNameFromStaticId(STATIC_ID_0)).rejects.toThrowError(MicroserviceClientError)
    })
  })

  describe('getCompanyInfoFromStaticId', () => {
    it('should get a member entry successfully', async () => {
      const expectedData = [
        {
          x500Name: {
            O: 'Company Name'
          },
          isFinancialInstitution: false
        }
      ]
      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      const entry = await dataAgent.getCompanyInfoFromStaticId(STATIC_ID_0)

      expect(entry).toEqual(expectedData[0])
    })

    it('should throw an error if no data is returned', async () => {
      const expectedData = null

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      await expect(dataAgent.getCompanyInfoFromStaticId(STATIC_ID_0)).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if data returned is empty', async () => {
      const expectedData = []

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      await expect(dataAgent.getCompanyInfoFromStaticId(STATIC_ID_0)).rejects.toThrowError(MicroserviceClientError)
    })

    it('should throw an error if the request fails', async () => {
      axiosMock.onGet(/api-registry.*/).networkErrorOnce(500)

      await expect(dataAgent.getCompanyInfoFromStaticId(STATIC_ID_0)).rejects.toThrowError(MicroserviceClientError)
    })
  })
})
