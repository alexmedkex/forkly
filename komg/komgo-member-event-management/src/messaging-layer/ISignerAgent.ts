import { IEncryptedEnvelope, IJSONPublicKey } from './types'

export default interface ISignerAgent {
  encrypt(payload: string, jwk: any): Promise<any>
  decrypt(jwe: IEncryptedEnvelope): Promise<any>
  sign(payload: any): Promise<any>
  verify(jws: any, jwk: IJSONPublicKey): Promise<any>
}
