import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'jest'
import 'reflect-metadata'

import CompanyRegistryService from './CompanyRegistryService'

const apiRegistryUrl = 'http://localhost:9001'

const companyResponse = {
  staticId: 'static-id-01'
}

const axiosMock = new MockAdapter(axios)

describe('CompanyRegistryService', () => {
  let service: CompanyRegistryService
  describe('for one company', () => {
    beforeAll(function() {
      service = new CompanyRegistryService(apiRegistryUrl)
      getReply(
        apiRegistryUrl,
        `/v0/registry/cache/?companyData=${encodeURIComponent(JSON.stringify({ staticId: companyResponse.staticId }))}`,
        200,
        [companyResponse]
      )
      getReply(
        apiRegistryUrl,
        `/v0/registry/cache/?companyData=${encodeURIComponent(JSON.stringify({ staticId: '1234' }))}`,
        200,
        []
      )
    })

    it('should call axios.get with correct arguments', async () => {
      const spy = jest.spyOn(axios, 'get')
      await service.getCompany('static-id-01')
      expect(spy).toHaveBeenCalledWith(
        'http://localhost:9001/v0/registry/cache/?companyData=%7B%22staticId%22%3A%22static-id-01%22%7D'
      )
    })

    it('should return a company', async () => {
      const result = await service.getCompany('static-id-01')
      expect(result).toEqual(companyResponse)
    })

    it('should throw an error if company not found', async () => {
      await expect(service.getCompany('1234')).rejects.toEqual(
        ErrorUtils.notFoundException(
          ErrorCode.ValidationHttpContent,
          `Company with staticId 1234 not found in the registry cache`
        )
      )
    })
  })
  describe('for all companies', () => {
    beforeAll(function() {
      jest.clearAllMocks()
      service = new CompanyRegistryService(apiRegistryUrl)
      getReply(apiRegistryUrl, `/v0/registry/cache/?companyData=${encodeURIComponent('{}')}`, 200, [companyResponse])
    })
    it('should call get all records', async () => {
      const spy = jest.spyOn(axios, 'get')
      await service.getAllCompanies()
      expect(spy).toHaveBeenCalledWith('http://localhost:9001/v0/registry/cache/?companyData=%7B%7D')
    })

    it('should throw an error if company not found', async () => {
      getReply(apiRegistryUrl, `/v0/registry/cache/?companyData=${encodeURIComponent('{}')}`, 200, [])
      await expect(service.getAllCompanies()).rejects.toEqual(
        ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, `Companies not found in the registry cache`)
      )
    })
    it('should throw an error on axios request failed', async () => {
      axiosMock.onGet('http://localhost:9001/v0/registry/cache/?companyData=%7B%7D').reply(() => {
        throw 'exception'
      })
      await expect(service.getAllCompanies()).rejects.toEqual(
        ErrorUtils.internalServerException(
          ErrorCode.ConnectionMicroservice,
          `Failed to get company records in the registry cache`
        )
      )
    })
  })

  function getReply(server, path, status, body) {
    axiosMock.onGet(`${server}${path}`).reply(status, JSON.stringify(body))
  }
})
