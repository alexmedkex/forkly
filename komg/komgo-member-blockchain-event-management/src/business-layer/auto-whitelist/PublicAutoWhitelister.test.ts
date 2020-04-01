import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ContractAddressDataAgent } from '../../data-layer/data-agents'
import { CompanyRegistryError } from '../errors'

import { CompanyRegistryClient } from './CompanyRegistryClient'
import PublicAutoWhitelister from './PublicAutoWhitelister'

const DOMAIN = 'domain'
const NODE = '0x9b49ec12f2d68ed751ce7e850643857a79186043199ceabcfe6be8a4c435edd7'

describe('PublicAutoWhitelister', () => {
  let whitelister: PublicAutoWhitelister
  let mockContractAddressDataAgent: jest.Mocked<ContractAddressDataAgent>
  let mockCompanyRegistryClient: jest.Mocked<CompanyRegistryClient>

  beforeEach(() => {
    mockContractAddressDataAgent = createMockInstance(ContractAddressDataAgent)
    mockCompanyRegistryClient = createMockInstance(CompanyRegistryClient)

    whitelister = new PublicAutoWhitelister(mockContractAddressDataAgent, mockCompanyRegistryClient)
  })

  describe('whitelistAddress', () => {
    it('should whitelist an address successfully', async () => {
      const expectedAddress = '0xaddress'

      await whitelister.whitelistAddress('myDomain', expectedAddress)

      expect(mockContractAddressDataAgent.whitelist).toHaveBeenCalledWith(expectedAddress)
    })
  })

  describe('whitelistDomain', () => {
    it('should whitelist domain successfully', async () => {
      const expectedAddress = '0xaddress'
      mockCompanyRegistryClient.getContractAddress.mockResolvedValueOnce(expectedAddress)

      await whitelister.whitelistDomain(DOMAIN)

      expect(mockCompanyRegistryClient.getContractAddress).toHaveBeenCalledWith(NODE)
      expect(mockContractAddressDataAgent.whitelist).toHaveBeenCalledWith(expectedAddress)
    })

    it('should throw an error if call to api-registry fails', async () => {
      mockCompanyRegistryClient.getContractAddress.mockRejectedValueOnce(new CompanyRegistryError('data'))

      await expect(whitelister.whitelistDomain(DOMAIN)).rejects.toThrowError(CompanyRegistryError)
    })

    it('should throw an error if whitelisting in DB fails', async () => {
      mockContractAddressDataAgent.whitelist.mockRejectedValueOnce(new Error())

      await expect(whitelister.whitelistDomain(DOMAIN)).rejects.toThrow()
    })
  })
})
