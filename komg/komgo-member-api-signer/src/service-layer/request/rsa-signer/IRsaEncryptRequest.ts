import { IJSONPublicKey } from '@komgo/jose'

export interface IRsaEncryptRequest {
  payload: string
  jwk: IJSONPublicKey
}
