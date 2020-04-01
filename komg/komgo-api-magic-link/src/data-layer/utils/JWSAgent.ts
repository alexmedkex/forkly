import axios from 'axios'
import { inject, injectable } from 'inversify'
import * as jwt from 'jsonwebtoken'

import { TYPES } from '../../inversify/types'

export interface IJWSAgent {
  decode(jws: string): IDecodedJWS
  verify(jws: string, staticId: string): Promise<boolean>
  decodeAndVerify(jws: string): Promise<IDecodedJWS>
}

export interface IDecodedJWS {
  staticId: string
  jti: string
  hash: string
  deactivated: boolean
  docId?: string
  merkle?: string
  metadataHash?: string
  timestamp?: string
}

@injectable()
export default class JWSAgent implements IJWSAgent {
  constructor(
    @inject(TYPES.ApiRegistryUrl) private readonly registryBaseUrl: string,
    @inject(TYPES.ApiSignerUrl) private readonly signerBaseUrl: string
  ) {}

  decode(jws: string): IDecodedJWS {
    return jwt.decode(jws) as IDecodedJWS
  }

  async verify(jws: string, staticId: string): Promise<boolean> {
    const response: any = await axios.get(
      `${this.registryBaseUrl}/v0/registry/cache?companyData=${encodeURIComponent(`{"staticId" : "${staticId}" }`)}`
    )
    const lastKeyObj = response.data[0].komgoMessagingPubKeys[response.data[0].komgoMessagingPubKeys.length - 1]
    const parsedKey = JSON.parse(lastKeyObj.key)
    await axios.post(`${this.signerBaseUrl}/v0/rsa-signer/verify`, { jws, jwk: parsedKey })
    return true
  }

  async decodeAndVerify(jws: string): Promise<IDecodedJWS> {
    const decodedJWS = this.decode(jws) as IDecodedJWS
    await this.verify(jws, decodedJWS.staticId)

    return decodedJWS
  }
}
