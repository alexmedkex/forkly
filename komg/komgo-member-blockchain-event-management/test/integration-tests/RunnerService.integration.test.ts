import Axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'reflect-metadata'

import { ContractAddressDataAgent } from '../../src/data-layer/data-agents'
import { ContractAddressStatus } from '../../src/data-layer/models/contract-address'
import { iocContainer } from '../../src/inversify/ioc'
import { TYPES } from '../../src/inversify/types'
import { VALUES } from '../../src/inversify/values'
import IService from '../../src/service-layer/IService'

import IntegrationEnvironment from './utils/IntegrationEnvironment'

jest.setTimeout(150000)

const NB_DOMAINS = iocContainer.get<string[]>(VALUES.KomgoContractDomains).length // can't bigger than 9 or addresses will be invalid
const ADDRESS_PREFIX = '0xa0c2bae464ef41e9457a69d5e125be64d07fa90'
const ENS_REGISTRY_CONTRACT_ADDRESS = '0xa0c2bae464ef41e9457a69d5e125be64d07fa900'

/**
 * This integration test uses MongoDB real container
 */
describe('RunnerService Integration', () => {
  let iEnv: IntegrationEnvironment
  let service: IService
  let contractAddressDataAgent: ContractAddressDataAgent
  let axiosMock: MockAdapter

  beforeAll(async () => {
    axiosMock = new MockAdapter(Axios)

    iEnv = new IntegrationEnvironment(true, false)
    await iEnv.beforeAll()

    iocContainer.rebind<string>(VALUES.ENSRegistryContractAddress).toConstantValue(ENS_REGISTRY_CONTRACT_ADDRESS)

    contractAddressDataAgent = iocContainer.get<ContractAddressDataAgent>(TYPES.ContractAddressDataAgent)
    service = iocContainer.get<IService>(TYPES.RunnerService)
  })

  /**
   * Given:
   * Api Registry fails once and then succeeds
   *
   * When:
   * Service is running
   *
   * Then:
   * Service starts and all smart contract addresses are successfully whitelisted
   */
  it('should retrieve the addresses and whitelist all public smart contracts given their domain', async () => {
    mockErrorApiRegistry()
    mockSuccessApiRegistry()

    await service.start()

    for (let i = 1; i <= NB_DOMAINS; i++) {
      const status = await contractAddressDataAgent.getStatus(`${ADDRESS_PREFIX}${i}`)
      expect(status).toEqual(ContractAddressStatus.Whitelisted)
    }
  })

  afterEach(async () => {
    await iEnv.afterEach()
    service.stop()
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
})
