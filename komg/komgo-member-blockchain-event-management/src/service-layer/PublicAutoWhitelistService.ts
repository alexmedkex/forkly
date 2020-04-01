import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'

import PublicAutoWhitelister from '../business-layer/auto-whitelist/PublicAutoWhitelister'
import { TYPES } from '../inversify/types'
import { VALUES } from '../inversify/values'
import { ErrorName } from '../util/ErrorName'

export const ENS_REGISTRY_CONTRACT_NAME = 'ENSRegistry'

@injectable()
export default class PublicAutoWhitelistService {
  private readonly logger = getLogger('PublicAutoWhitelistService')

  constructor(
    @inject(TYPES.PublicAutoWhitelister) private readonly whitelister: PublicAutoWhitelister,
    @inject(VALUES.ENSRegistryContractAddress) private readonly ensRegistryContractAddress: string,
    @inject(VALUES.KomgoContractDomains) private readonly domains: string[]
  ) {}

  public async start() {
    this.logger.info('Starting public auto whitelist service', { domains: this.domains })

    try {
      await this.whitelister.whitelistAddress(ENS_REGISTRY_CONTRACT_NAME, this.ensRegistryContractAddress)
      for (const domain of this.domains) {
        await this.whitelister.whitelistDomain(domain)
      }

      this.logger.info('Public smart contracts auto whitelisting executed successfully', { domains: this.domains })
    } catch (error) {
      this.logger.error(
        ErrorCode.Configuration,
        ErrorName.PublicAutoWhitelist,
        'Failed to auto whitelist public smart contracts',
        {
          domains: this.domains
        }
      )

      throw error
    }
  }
}
