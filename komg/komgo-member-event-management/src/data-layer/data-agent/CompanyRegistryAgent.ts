import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import Axios, { AxiosInstance } from 'axios'
import { inject, injectable } from 'inversify'

import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../util/ErrorName'
import { RequestIdHandler } from '../../util/RequestIdHandler'

import { ICompanyRegistryAgent } from './ICompanyRegistryAgent'

const namehash = require('eth-ens-namehash')

@injectable()
export default class CompanyRegistryAgent implements ICompanyRegistryAgent {
  private axios: AxiosInstance
  private logger = getLogger('CompanyRegistryAgent')

  constructor(
    @inject('api-registry-base-url') private readonly apiRegistryBaseUrl: string,
    @inject(TYPES.RequestIdHandler) requestIdHandler: RequestIdHandler | any
  ) {
    this.axios = Axios.create({})
    requestIdHandler.addToAxios(this.axios)
    this.logger.addLoggingToAxios(this.axios)
  }

  async getMnidFromStaticId(staticId: string): Promise<string> {
    try {
      const domain = `${staticId}.meta.komgo`
      const node = namehash.hash(domain)
      const query = `{"node" : "${node}" }`
      this.logger.info('Getting Mnid from statidId', { query, staticId })
      const response = await this.doRequest(query)
      if (!response || !response.data || response.data.length === 0 || !response.data[0].komgoMnid) {
        this.logger.error(ErrorCode.Configuration, ErrorName.CompanyRegistryNoMINDFromStaticId, {
          query,
          domain,
          node,
          staticId
        })
        return
      }
      const komgoMnid = response.data[0].komgoMnid
      return komgoMnid
    } catch (error) {
      this.logger.warn(ErrorCode.ConnectionMicroservice, ErrorName.CompanyRegistryRequestFailed, error.response.data)
    }
  }

  async getEntryFromStaticId(staticId: string): Promise<string> {
    try {
      const domain = `${staticId}.meta.komgo`
      const node = namehash.hash(domain)
      const query = `{"node" : "${node}" }`
      const response = await this.doRequest(query)
      this.logger.info('Getting Entry from statidId', { query, staticId })
      if (!response || !response.data || response.data.length === 0) {
        this.logger.error(ErrorCode.Configuration, ErrorName.CompanyRegistryNoEntryFromStaticId, {
          query,
          domain,
          node,
          staticId
        })
        return
      }
      return response.data[0]
    } catch (error) {
      this.logger.warn(ErrorCode.ConnectionMicroservice, ErrorName.CompanyRegistryRequestFailed, error.response.data)
    }
  }

  async getPropertyFromMnid(mnidType: string, mnid: string, property: string): Promise<string> {
    try {
      const query = `{"${mnidType}" : "${mnid}" }`
      const response = await this.doRequest(query)
      if (!response || !response.data || response.data.length === 0 || !response.data[0][property]) {
        this.logger.error(ErrorCode.Configuration, ErrorName.CompanyRegistryNoPropertyFromMNID, {
          query,
          mnid,
          property,
          mnidType
        })
        return
      }
      const prop = response.data[0][property]
      return prop
    } catch (error) {
      this.logger.warn(ErrorCode.ConnectionMicroservice, ErrorName.CompanyRegistryRequestFailed, error.response.data)
    }
  }

  private async doRequest(query: string): Promise<any> {
    return this.axios.get(`${this.apiRegistryBaseUrl}/v0/registry/cache/?companyData=${encodeURIComponent(query)}`)
  }
}
