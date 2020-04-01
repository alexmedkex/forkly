import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import NameHash from 'eth-ens-namehash'
import { injectable, inject } from 'inversify'

import { ContractAddressDataAgent } from '../../data-layer/data-agents'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../util/ErrorName'
import { Metric, Action, AutoWhitelistType } from '../../util/Metrics'
import { CompanyRegistryError } from '../errors'

import { CompanyRegistryClient } from './CompanyRegistryClient'

@injectable()
export default class PublicAutoWhitelister {
  private readonly logger = getLogger('PublicAutoWhitelister')

  constructor(
    @inject(TYPES.ContractAddressDataAgent) private readonly contractAddressDataAgent: ContractAddressDataAgent,
    @inject(TYPES.CompanyRegistryClient) private readonly companyRegistryClient: CompanyRegistryClient
  ) {}

  /**
   * Log and Whitelists a contract in DB
   *
   * @param domain Domain of the contract to whitelist
   * @param address Address of the contract to whitelist
   */
  public async whitelistAddress(domain: string, address: string) {
    await this.contractAddressDataAgent.whitelist(address)
    this.logger.info('Public contract successfully whitelisted', {
      domain,
      [Metric.Address]: address,
      [Metric.Action]: Action.Whitelisted,
      [Metric.AutoWhitelist]: true,
      [Metric.AutoWhitelistType]: AutoWhitelistType.Public
    })
  }

  /**
   * Auto whitelist public smart contract at domain
   *
   * @param domain ENS domain for contract address
   */
  public async whitelistDomain(domain: string) {
    try {
      this.logger.debug('Getting contract address from api-registry', {
        domain
      })

      const node: string = NameHash.hash(domain)
      const address = await this.companyRegistryClient.getContractAddress(node)

      await this.whitelistAddress(domain, address)
    } catch (error) {
      if (error instanceof CompanyRegistryError) {
        this.logger.error(
          ErrorCode.ConnectionMicroservice,
          ErrorName.CompanyRegistryRequest,
          'Could not retrieve domain address from api-registry',
          {
            errorMessage: error.message,
            domain,
            data: error.data
          }
        )
      } else {
        this.logger.error(
          ErrorCode.ConnectionDatabase,
          ErrorName.MongoConnection,
          'Could not whitelist contract in DB',
          {
            domain,
            errorMessage: error.message
          }
        )
      }

      throw error
    }
  }
}
