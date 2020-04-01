import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import Axios from 'axios'
import { inject, injectable } from 'inversify'

import { CONFIG_KEYS } from '../../inversify/config_keys'
import { ErrorName } from '../../middleware/common/Constants'

import { AuthTokenResponse } from './response/AuthTokenResponse'
import IRsaKeyData from './response/IRsaKeyData'
import { KvReadResponse } from './response/KvReadResponse'

@injectable()
export default class VaultClient {
  private readonly logger = getLogger('VaultClient')
  private vaultToken: string
  private readonly url: string

  constructor(
    @inject(CONFIG_KEYS.vaultUrl) private readonly vaultUrl: string,
    @inject(CONFIG_KEYS.vaultRoleId) private readonly vaultRoleId: string,
    @inject(CONFIG_KEYS.vaultSecretId) private readonly vaultSecretId: string,
    @inject(CONFIG_KEYS.apiVersion) private readonly apiVersion: string
  ) {
    this.url = vaultUrl + '/' + apiVersion + '/'
  }

  public async loginWithAuthToken(): Promise<boolean> {
    if (this.hasAuthToken()) return true

    try {
      const authToken: AuthTokenResponse = await this.requestAuthToken(this.vaultRoleId, this.vaultSecretId)
      this.vaultToken = authToken.auth.client_token
      this.logger.info('Vault auth token available')
    } catch (e) {
      this.logger.error(ErrorCode.ConnectionVault, ErrorName.VaultAuthFailed, 'Failed to fetch auth token', {
        errorMessage: e.message
      })
    }

    return this.hasAuthToken()
  }

  public isAvailable(): boolean {
    return !!this.vaultUrl && !!this.vaultRoleId && !!this.vaultSecretId && !!this.apiVersion
  }

  public async storeRsaKey(rsaKey: string) {
    const keyData = { key: rsaKey }
    await this.storeKeyData(keyData)
  }

  public async readRsaKey(): Promise<string> {
    const keyData = await this.readKeyData()
    return keyData.key
  }

  public async storeKeyData(keyData: IRsaKeyData) {
    await this.writeKVSecret('rsa-key', keyData)
  }

  public async readKeyData(): Promise<IRsaKeyData> {
    const rawData = await this.readRawData()
    return rawData.data
  }
  public async readRawData(version?: number): Promise<KvReadResponse> {
    try {
      const response = await this.readKVSecret('rsa-key', version)
      return response
    } catch (e) {
      this.logger.error(ErrorCode.ConnectionVault, ErrorName.VaultReadKVFailed, 'Failed to read key from kv engine', {
        errorMessage: e.message
      })
      throw e
    }
  }

  public async writeKVSecret(name: string, value: any) {
    try {
      await this.loginWithAuthToken()
      await this.postRequest(this.url + 'secret/data/' + name, { data: value })
    } catch (e) {
      this.logger.error(
        ErrorCode.ConnectionVault,
        ErrorName.VaultWriteKVFailed,
        'Failed to write secret to kv engine',
        {
          errorMessage: e.message
        }
      )
      throw e
    }
  }

  public async readKVSecret(name: string, version?: number): Promise<any> {
    try {
      await this.loginWithAuthToken()
      const queryParams = version ? `?version=${version}` : ''
      const fullUrl = `${this.url}secret/data/${name}${queryParams}`
      const response = await this.getRequest(fullUrl)
      return response.data
    } catch (e) {
      this.logger.error(ErrorCode.ConnectionVault, ErrorName.VaultReadKVFailed, 'Failed to fetch KV secret', {
        errorMessage: e.message
      })
      throw e
    }
  }

  private hasAuthToken(): boolean {
    return !!this.vaultToken
  }

  private async requestAuthToken(roleId: string, secretId: string): Promise<AuthTokenResponse> {
    try {
      const response = await this.postRequest(this.url + 'auth/approle/login', { role_id: roleId, secret_id: secretId })
      return response
    } catch (e) {
      this.logger.error(ErrorCode.ConnectionVault, ErrorName.VaultAuthFailed, 'Failed to request auth token', {
        errorMessage: e.message
      })
      throw e
    }
  }

  private async postRequest(path: string, data: any, errorMessage?: string): Promise<any> {
    try {
      this.logger.info('Sending POST request to "%s"', path)
      const response = await Axios.post(path, data, this.getHeaders())
      return response.data
    } catch (error) {
      throw new Error(errorMessage || `Failed post request for : ${path}, with : ${error.message}`)
    }
  }

  private async getRequest(path: string, errorMessage?: string): Promise<any> {
    try {
      this.logger.info('Sending GET request to "%s"', path)
      const response = await Axios.get(path, this.getHeaders())
      return response.data
    } catch (error) {
      throw new Error(errorMessage || `Failed get request for : ${path}, with : ${error.message}`)
    }
  }

  private getHeaders() {
    return this.vaultToken ? { headers: { 'X-Vault-Token': this.vaultToken } } : undefined
  }
}
