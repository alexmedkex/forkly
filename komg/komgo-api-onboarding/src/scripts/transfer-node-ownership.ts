import { getLogger, configureLogging, LogLevel } from '@komgo/logging'

import { ENSCompanyOnboarder } from '../business-layer/onboard-member-ens/ENSCompanyOnboarder'
import CompanyRegistryService from '../infrastructure/api-registry/CompanyRegistryService'
import { iocContainer } from '../inversify/ioc'
import { TYPES } from '../inversify/types'
import { ContractArtifacts } from '../utils/contract-artifacts'

configureLogging('script', LogLevel.Info, true)
const logger = getLogger('migration script')

export const run = async () => {
  logger.info('starting migration')
  const companyOnboarder: ENSCompanyOnboarder = iocContainer.get<ENSCompanyOnboarder>(ENSCompanyOnboarder)
  const registry: CompanyRegistryService = iocContainer.get<CompanyRegistryService>(TYPES.CompanyRegistryService)
  const contractArtifacts: ContractArtifacts = iocContainer.get<ContractArtifacts>(TYPES.ContractArtifacts)
  const companies = await registry.getAllCompanies()
  const onboarderAddress = await contractArtifacts.komgoOnboarder()
  logger.info(`new onboarder address ${onboarderAddress._address}`)
  for (const company of companies) {
    logger.info(`transfering node owndership for ${company.node} to onboarder`)
    try {
      await companyOnboarder.transferEnsNodesOwnership(company.node, onboarderAddress._address)
      logger.info(`succesfully transfered node owndership for ${company.node}`)
    } catch (e) {
      logger.info(`transfer failed for ${company.node}. The node may already have the correct owner`)
    }
  }
}

if (require.main === module) {
  run().then(() => process.exit(0))
}
