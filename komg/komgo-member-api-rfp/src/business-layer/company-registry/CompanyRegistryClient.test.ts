import Axios, { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'reflect-metadata'

import { MOCK_COMPANY_ENTRY } from '../../../integration-tests/utils/mock-data'
import { createRetryingAxios } from '../../service-layer/utils/axiosRetryFactory'

import CompanyRegistryClient from './CompanyRegistryClient'
import CompanyRegistryError from './CompanyRegistryError'

const API_REGISTRY_DOMAIN = 'http://api-registry'
const STATIC_ID = 'staticId0'

describe('CompanyRegistryClient', () => {
  let client: CompanyRegistryClient
  let axiosMock: MockAdapter
  let axiosInstance: AxiosInstance

  beforeAll(() => {
    axiosMock = new MockAdapter(Axios)
    axiosInstance = createRetryingAxios(0)
  })

  beforeEach(() => {
    client = new CompanyRegistryClient(API_REGISTRY_DOMAIN, axiosInstance)
  })

  describe('getAllMembersStaticIds', () => {
    it('should get a contract address successfully', async () => {
      axiosMock.onGet(/api-registry.*/).replyOnce(200, [MOCK_COMPANY_ENTRY])

      const response = await client.getEntryFromStaticId(STATIC_ID)

      expect(response).toEqual(MOCK_COMPANY_ENTRY)
    })

    it('should return null if no data is returned', async () => {
      const expectedData = null

      axiosMock.onGet(/api-registry.*/).replyOnce(200, expectedData)

      const response = await client.getEntryFromStaticId(STATIC_ID)
      expect(response).toBe(null)
    })

    it('should throw an error if the request fails', async () => {
      axiosMock.onGet(/api-registry.*/).networkErrorOnce(500)

      await expect(client.getEntryFromStaticId(STATIC_ID)).rejects.toThrowError(CompanyRegistryError)
    })
  })
})
