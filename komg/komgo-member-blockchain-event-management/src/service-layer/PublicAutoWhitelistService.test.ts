import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import PublicAutoWhitelister from '../business-layer/auto-whitelist/PublicAutoWhitelister'

import PublicAutoWhitelistService, { ENS_REGISTRY_CONTRACT_NAME } from './PublicAutoWhitelistService'

const ENS_REGISTRY_CONTRACT_ADDRESS = '0xensAddress'
const DOCUMENT_REGISTRY_DOMAIN = 'documentregistry.komgo.contract'
const KOMGO_META_RESOLVER_DOMAIN = 'komgometaresolver.komgo.contract'
const KOMGO_REGISTRAR_DOMAIN = 'komgoregistrar.komgo.contract'
const KOMGO_RESOLVER_DOMAIN = 'komgoresolver.komgo.contract'

describe('PublicAutoWhitelistService', () => {
  let service: PublicAutoWhitelistService
  let mockPublicAutoWhitelister: jest.Mocked<PublicAutoWhitelister>

  beforeEach(() => {
    mockPublicAutoWhitelister = createMockInstance(PublicAutoWhitelister)

    service = new PublicAutoWhitelistService(mockPublicAutoWhitelister, ENS_REGISTRY_CONTRACT_ADDRESS, [
      DOCUMENT_REGISTRY_DOMAIN,
      KOMGO_META_RESOLVER_DOMAIN,
      KOMGO_REGISTRAR_DOMAIN,
      KOMGO_RESOLVER_DOMAIN
    ])
  })

  describe('start()', () => {
    it('should whitelist all public smart contracts successfully', async () => {
      await service.start()

      expect(mockPublicAutoWhitelister.whitelistAddress).toHaveBeenCalledTimes(1)
      expect(mockPublicAutoWhitelister.whitelistAddress).toHaveBeenCalledWith(
        ENS_REGISTRY_CONTRACT_NAME,
        ENS_REGISTRY_CONTRACT_ADDRESS
      )
      expect(mockPublicAutoWhitelister.whitelistDomain).toHaveBeenCalledTimes(4)
      expect(mockPublicAutoWhitelister.whitelistDomain).toHaveBeenNthCalledWith(1, DOCUMENT_REGISTRY_DOMAIN)
      expect(mockPublicAutoWhitelister.whitelistDomain).toHaveBeenNthCalledWith(2, KOMGO_META_RESOLVER_DOMAIN)
      expect(mockPublicAutoWhitelister.whitelistDomain).toHaveBeenNthCalledWith(3, KOMGO_REGISTRAR_DOMAIN)
      expect(mockPublicAutoWhitelister.whitelistDomain).toHaveBeenNthCalledWith(4, KOMGO_RESOLVER_DOMAIN)
    })

    it('should throw an error if whitelist call fails', async () => {
      mockPublicAutoWhitelister.whitelistDomain.mockRejectedValueOnce(new Error())

      await expect(service.start()).rejects.toThrow()
    })
  })
})
