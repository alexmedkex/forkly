import { IJSONPublicKey } from '@komgo/jose'

export interface IVerifyRequest {
  jws: string
  jwk: IJSONPublicKey
}
