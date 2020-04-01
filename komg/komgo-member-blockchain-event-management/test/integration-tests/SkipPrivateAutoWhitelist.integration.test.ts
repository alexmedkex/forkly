import 'reflect-metadata'

import { EventProcessedDataAgent } from '../../src/data-layer/data-agents'
import { AutoWhitelistDataAgent } from '../../src/data-layer/data-agents/AutoWhitelistDataAgent'
import { AutoWhitelist } from '../../src/data-layer/models/auto-whitelist'
import { iocContainer } from '../../src/inversify/ioc'
import { TYPES } from '../../src/inversify/types'
import { VALUES } from '../../src/inversify/values'
import PrivateAutoWhitelistService from '../../src/service-layer/PrivateAutoWhitelistService'
import LightContractLibraryMock from '../LightContractLibraryMock'

import IntegrationEnvironment from './utils/IntegrationEnvironment'

// Wait for quorum and mongo
jest.setTimeout(150000)

/**
 * This integration test uses MongoDB and Quorum real containers
 */
describe('PrivateAutoWhitelist Integration', () => {
  let iEnv: IntegrationEnvironment
  let service: PrivateAutoWhitelistService
  let autoWhitelistDataAgent: AutoWhitelistDataAgent

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment(true, false)
    await iEnv.beforeAll()

    autoWhitelistDataAgent = iocContainer.get<AutoWhitelistDataAgent>(TYPES.AutoWhitelistDataAgent)
    // Use the mocked light contract library for the tests
    iocContainer.rebind<any>(VALUES.LightContractLibrary).toConstantValue(LightContractLibraryMock)
    service = iocContainer.get<PrivateAutoWhitelistService>(TYPES.PrivateAutoWhitelistService)
  })

  beforeEach(async () => {
    await AutoWhitelist.deleteMany({}) // clean mongo
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  /**
   * Given:
   * Auto whitelist env var is unset (default is 0)
   * No events processed previously (lastEventProcessed = undefined)
   * A deprecated komgo contract is deployed
   *
   * When:
   * Service starts
   *
   * Then:
   * Auto-whitelisting is skipped
   */
  it('should skip auto whitelist if no auto-whitelist environment variable is set and there is no last event processed', async () => {
    await service.start()

    await expect(autoWhitelistDataAgent.getStopBlockNumber()).resolves.toEqual(-1)
  })

  /**
   * Given:
   * Auto whitelist env var is unset (default is 0)
   * No events processed previously (lastEventProcessed = undefined)
   * A deprecated komgo contract is deployed
   *
   * When:
   * Service starts
   *
   * Then:
   * Auto-whitelisting is skipped
   */
  it('should not re-set the last block if restarted', async () => {
    await service.start()

    setAutoWhitelistBeforeBlock(20)
    await setLastEventProcessedBlock(10)

    await service.start()

    await expect(autoWhitelistDataAgent.getStopBlockNumber()).resolves.toEqual(-1)
  })

  async function setLastEventProcessedBlock(blockNumber: number) {
    const agent = iocContainer.get<EventProcessedDataAgent>(TYPES.EventProcessedDataAgent)
    return agent.saveEventProcessed(blockNumber, '0x', 0)
  }

  function setAutoWhitelistBeforeBlock(blockNumber: number) {
    iocContainer.rebind<number>(VALUES.AutoWhitelistBeforeBlock).toConstantValue(blockNumber)
    iocContainer
      .rebind<PrivateAutoWhitelistService>(TYPES.PrivateAutoWhitelistService)
      .to(PrivateAutoWhitelistService)
      .inSingletonScope()
    iocContainer.rebind<PrivateAutoWhitelistService>(TYPES.PrivateAutoWhitelistService).to(PrivateAutoWhitelistService)
    service = iocContainer.get<PrivateAutoWhitelistService>(TYPES.PrivateAutoWhitelistService)
  }
})
