import { getLogger } from '@komgo/logging'
import axios, { AxiosInstance } from 'axios'
import * as http from 'http'
import * as httpProxyAgent from 'http-proxy-agent'
import * as https from 'https'
import * as httpsProxyAgent from 'https-proxy-agent'
import { inject, injectable } from 'inversify'

import { CONFIG_KEYS } from '../../inversify/config_keys'

export interface IMagicLinkService {
  deactivateDocument(data: IDecodedDocumentDeactivationRequest): Promise<void>
  isDeactivated(hash: string): Promise<boolean>
}

export interface ISignedData {
  jws: string
}

export interface ISessionResponse {
  sessionId: string
  staticId: string
  merkle?: string
  metadataHash?: string
  timestamp?: string
  activated?: boolean
}

export interface ISessionRequest {
  staticId: string
  docId?: string
  merkle?: string
  metadataHash?: string
}

export interface IDecodedDocumentDeactivationRequest {
  staticId: string
  jti: string
  hash: string
  deactivated: boolean
}

export interface IKomgoStampDocument {
  registered?: boolean
  deactivated: boolean
  documentInfo?: {
    registeredBy: string
    registeredAt: string
  }
}

@injectable()
export default class MagicLinkService implements IMagicLinkService {
  private readonly logger = getLogger('MagicLinkService')
  private readonly axiosMagicLinkKNode: AxiosInstance

  constructor(
    @inject(CONFIG_KEYS.ApiMagicLinkUrl) private readonly magicLinkBaseUrl: string,
    @inject(CONFIG_KEYS.ApiSignerUrl) private readonly signerBaseUrl: string,
    @inject(CONFIG_KEYS.HTTPProxy) private readonly httpProxy: string,
    @inject(CONFIG_KEYS.HTTPSProxy) private readonly httpsProxy: string
  ) {
    const httpAgent = this.httpProxy ? new httpProxyAgent(this.httpProxy) : new http.Agent({ keepAlive: true })
    const httpsAgent = this.httpsProxy ? new httpsProxyAgent(this.httpsProxy) : new https.Agent({ keepAlive: true })
    this.logger.info('Using proxy to reach the knode', { httpProxy, httpsProxy })

    this.axiosMagicLinkKNode = axios.create({
      baseURL: this.magicLinkBaseUrl,
      httpAgent,
      httpsAgent,
      proxy: false // disable proxy autoconfiguration
    })
  }

  async deactivateDocument(data) {
    const signedData = await this.signData(data)
    await this.axiosMagicLinkKNode.patch(`/v0/documents`, signedData)
  }

  async isDeactivated(hash) {
    // skip a blockchain check for faster response
    const resp = await this.axiosMagicLinkKNode.get<IKomgoStampDocument>(`/v0/documents/${hash}?blockchainCheck=false`)
    return resp.data.deactivated
  }

  private async signData(data: ISessionRequest): Promise<ISignedData> {
    const response = await axios.post(`${this.signerBaseUrl}/v0/rsa-signer/sign`, {
      payload: JSON.stringify(data)
    })
    return response.data
  }
}
