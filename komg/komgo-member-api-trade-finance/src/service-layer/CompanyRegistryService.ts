import { injectable, inject } from 'inversify'
import { ICompanyRegistryService } from './ICompanyRegistryService'
import { getLogger } from '@komgo/logging'
import axios from 'axios'
import * as _ from 'lodash'
import { CONFIG } from '../inversify/config'
import { ErrorCode } from '@komgo/error-utilities'
import {
  MicroserviceConnectionException,
  InvalidDatabaseDataException,
  ContentNotFoundException,
  DatabaseConnectionException
} from '../exceptions'
import { ErrorNames } from '../exceptions/utils'

@injectable()
export default class CompanyRegistryService implements ICompanyRegistryService {
  private logger = getLogger('CompanyRegistryService')
  constructor(@inject(CONFIG.RegistryUrl) private readonly apiRegistryUrl: string) {}

  async getMember(staticId: string): Promise<any> {
    let response
    try {
      response = await axios.get(
        `${this.apiRegistryUrl}/v0/registry/cache/?companyData=${encodeURIComponent(JSON.stringify({ staticId }))}`
      )
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.GetMemberFailed,
        error.message,
        {
          staticId
        },
        new Error().stack
      )
      throw new MicroserviceConnectionException('Failed to get member.')
    }
    return response
  }

  async getMembers(staticIds: string[]): Promise<any> {
    const request = `{"staticId":{"$in":${JSON.stringify(staticIds)}}}`
    const response = await axios.get(
      `${this.apiRegistryUrl}/v0/registry/cache/?companyData=${encodeURIComponent(request)}`
    )

    if (!response || !response.data) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.GetMembersByStaticIdFailed,
        {
          staticIds
        },
        new Error().stack
      )
      throw new Error('getMembers: Error getting members')
    }

    return response.data
  }

  async getNodeKeys(members: string[]): Promise<string[]> {
    members = _.uniq(members)

    this.logger.info('Getting nodeKeys')
    const membersCleaned = members.filter(member => member !== '0x00')
    const queryObject = `{"node":{"$in":${JSON.stringify(membersCleaned)}}}`
    this.logger.info(`Querying company registry=${queryObject}`)

    let response
    try {
      response = await axios.get(
        `${this.apiRegistryUrl}/v0/registry/cache/?companyData=${encodeURIComponent(queryObject)}`
      )
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.GetNodeKeysFailed,
        error.message,
        {
          members
        },
        new Error().stack
      )
      throw new MicroserviceConnectionException('Failed to get node keys for members.')
    }
    if (!response || !response.data || response.data.length !== membersCleaned.length) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.NodeKeysNotFound,
        'Could not find all nodekeys for the members provided.',
        { members: membersCleaned },
        new Error().stack
      )
      throw new ContentNotFoundException(`Could not find all nodekeys for the members provided.`)
    }
    const membersNodeKeys = response.data.filter(member => member.isMember)
    this.logger.info(`Got nodeKeys=${membersNodeKeys}`)
    const membersWithNodeKeys = membersNodeKeys.filter(member => member.nodeKeys)
    if (membersNodeKeys.length !== membersWithNodeKeys.length) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorNames.InconsistentNodeKeys,
        `Some companies do not have nodeKeys`,
        { members: membersCleaned },
        new Error().stack
      )
      throw new InvalidDatabaseDataException(`Some companies do not have nodeKeys`)
    }
    return membersNodeKeys.map(member => JSON.parse(member.nodeKeys)).reduce((a, b) => a.concat(b))
  }

  async getMembersByNode(nodes: string[]): Promise<any> {
    this.logger.info(`Getting memebrs by nodes`)

    nodes = _.uniq(nodes).filter(member => member.indexOf('0x00') !== 0)

    const queryObject = `{"node":{"$in":${JSON.stringify(nodes)}}}`

    const response = await axios.get(
      `${this.apiRegistryUrl}/v0/registry/cache/?companyData=${encodeURIComponent(queryObject)}`
    )

    if (!response || !response.data) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorNames.GetMembersByNodeFailed, { nodes }, new Error().stack)
      throw new DatabaseConnectionException(`Could not find members`)
    }

    return response.data
  }
}
