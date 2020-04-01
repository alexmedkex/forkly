import { IEncryptedEnvelope, IDecryptedEnvelope } from './types'

export default interface IEnvelopeAgent {
  encapsulate(payload: object, recipientPublicKey: any): Promise<IEncryptedEnvelope>
  desencapsulate(encryptedEnvelope: IEncryptedEnvelope, publicKey: any): Promise<IDecryptedEnvelope>
}
