import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'reflect-metadata'

import { CompanyRegistryError } from '../../src/business-layer/errors'
import { ContractAddressDataAgent } from '../../src/data-layer/data-agents'
import { ContractAddressStatus } from '../../src/data-layer/models/contract-address'
import { iocContainer } from '../../src/inversify/ioc'
import { TYPES } from '../../src/inversify/types'
import { VALUES } from '../../src/inversify/values'
import PublicAutoWhitelistService from '../../src/service-layer/PublicAutoWhitelistService'

import IntegrationEnvironment from './utils/IntegrationEnvironment'

jest.setTimeout(10000)

const NB_DOMAINS = iocContainer.get<string[]>(VALUES.KomgoContractDomains).length // can't bigger than 9 or addresses will be invalid
const ADDRESS_PREFIX = '0xa0c2bae464ef41e9457a69d5e125be64d07fa90'
const ENS_REGISTRY_CONTRACT_ADDRESS = '0xa0c2bae464ef41e9457a69d5e125be64d07fa900'

/**
 * This integration test uses MongoDB real container
 */
describe('PublicAutoWhitelistService Integration', () => {
  let iEnv: IntegrationEnvironment
  let service: PublicAutoWhitelistService
  let contractAddressDataAgent: ContractAddressDataAgent
  let axiosMock: MockAdapter

  beforeAll(async () => {
    axiosMock = new MockAdapter(Axios)

    iEnv = new IntegrationEnvironment(false, false)
    await iEnv.beforeAll()

    iocContainer.rebind<string>(VALUES.ENSRegistryContractAddress).toConstantValue(ENS_REGISTRY_CONTRACT_ADDRESS)
    iocContainer.rebind<PublicAutoWhitelistService>(TYPES.PublicAutoWhitelistService).to(PublicAutoWhitelistService)
    iocContainer.rebind<ContractAddressDataAgent>(TYPES.ContractAddressDataAgent).to(ContractAddressDataAgent)

    contractAddressDataAgent = iocContainer.get<ContractAddressDataAgent>(TYPES.ContractAddressDataAgent)
    service = iocContainer.get<PublicAutoWhitelistService>(TYPES.PublicAutoWhitelistService)
  })

  /**
   * Given:
   * Multiple public smart contracts need to be whitelisted
   *
   * When:
   * Service is not running
   *
   * Then:
   * Service starts and all smart contracts are successfully whitelisted
   */
  it('should retrieve the addresses and whitelist all public smart contracts given their domain', async () => {
    mockSuccessApiRegistry()

    await service.start()

    const ensStatus = await contractAddressDataAgent.getStatus(ENS_REGISTRY_CONTRACT_ADDRESS)
    expect(ensStatus).toEqual(ContractAddressStatus.Whitelisted)

    for (let i = 1; i <= NB_DOMAINS; i++) {
      const status = await contractAddressDataAgent.getStatus(`${ADDRESS_PREFIX}${i}`)
      expect(status).toEqual(ContractAddressStatus.Whitelisted)
    }
  })

  /**
   * Given:
   * Multiple public smart contracts need to be whitelisted
   *
   * When:
   * Service is not running and api-registry returns 500
   *
   * Then:
   * Service starts and throws an error
   */
  it('should throw an error if api-registry returns a 500 error', async () => {
    mockErrorApiRegistry()

    await expect(service.start()).rejects.toThrowError(CompanyRegistryError)
  })

  /**
   * Given:
   * Multiple public smart contracts need to be whitelisted
   *
   * When:
   * Service is not running and api-registry returns invalid data
   *
   * Then:
   * Service starts and throws an error
   */
  it('should throw an error ', async () => {
    mockInvalidDataApiRegistry()

    await expect(service.start()).rejects.toThrowError(CompanyRegistryError)
  })

  afterEach(async () => {
    await iEnv.afterEach()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  function mockSuccessApiRegistry() {
    for (let i = 1; i <= NB_DOMAINS; i++) {
      axiosMock.onGet(/api-registry.*/).replyOnce(200, [
        {
          address: `${ADDRESS_PREFIX}${i}`
        }
      ])
    }
  }

  function mockErrorApiRegistry() {
    axiosMock.onGet(/api-registry.*/).replyOnce(500)
  }

  function mockInvalidDataApiRegistry() {
    axiosMock.onGet(/api-registry.*/).replyOnce(200, [])
  }
})
