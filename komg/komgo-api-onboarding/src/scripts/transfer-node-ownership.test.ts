import { ENSCompanyOnboarder } from '../business-layer/onboard-member-ens/ENSCompanyOnboarder'
import { iocContainer } from '../inversify/ioc'
import { TYPES } from '../inversify/types'

import { run } from './transfer-node-ownership'

describe('transfer node ownership', () => {
  let companyOnboarder
  let registry
  let contractArtifacts

  beforeEach(() => {
    companyOnboarder = {
      transferEnsNodesOwnership: jest.fn()
    }
    registry = {
      getAllCompanies: jest.fn(() => [
        {
          node: '0xnode'
        }
      ])
    }
    contractArtifacts = {
      komgoOnboarder: jest.fn(() => ({
        _address: '0xaddress'
      }))
    }
    iocContainer.rebind(ENSCompanyOnboarder).toConstantValue(companyOnboarder)
    iocContainer.rebind(TYPES.CompanyRegistryService).toConstantValue(registry)
    iocContainer.rebind(TYPES.ContractArtifacts).toConstantValue(contractArtifacts)
  })

  it('should call transferEnsNodesOwnership method of ENS onboarder', async () => {
    await run()
    expect(companyOnboarder.transferEnsNodesOwnership).toHaveBeenCalledWith('0xnode', '0xaddress')
  })
})
