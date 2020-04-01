import axios, { AxiosInstance } from 'axios'
import logger from '@komgo/logging'
import { IMemberClient } from './IMemberClient'
import { injectable } from 'inversify'
import * as config from 'config'

const API_REGISTRY_BASE_URL: string = config.get('registry.url')
logger.info('API_REGISTRY_BASE_URL:', API_REGISTRY_BASE_URL)

@injectable()
export class MemberClient implements IMemberClient {
  http: AxiosInstance

  constructor({ baseURL = API_REGISTRY_BASE_URL, ...options } = {}) {
    this.http = axios.create({
      baseURL,
      ...options
    })
  }

  async find(query = {}): Promise<any[]> {
    const response = await this.http.get(`/v0/registry/cache?companyData=${encodeURIComponent(JSON.stringify(query))}`)
    return response.data
  }
}
