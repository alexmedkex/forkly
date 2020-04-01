import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import { TYPES } from '../inversify/types'

import IEnvelopeAgent from './IEnvelopeAgent'
import ISignerAgent from './ISignerAgent'
import { IEncryptedEnvelope, IDecryptedEnvelope, IJSONPublicKey } from './types'

@injectable()
export default class EnvelopeAgent implements IEnvelopeAgent {
  private signerAgent: ISignerAgent
  private logger = getLogger('EnvelopeAgent')

  constructor(@inject(TYPES.SignerAgent) signerAgent: ISignerAgent | any) {
    this.signerAgent = signerAgent
  }

  async encapsulate(payload: object, recipientPublicKey: any): Promise<IEncryptedEnvelope> {
    this.logger.info(`About to sign and encrypt payload`)
    const jws = await this.signerAgent.sign(payload)
    const jwk = JSON.parse(recipientPublicKey.key)
    this.logger.info(`Signed payload, going to encrypt`)
    const jwe = await this.signerAgent.encrypt(jws.jws, jwk)
    this.logger.info(`Payload encrypted`)
    return {
      message: jwe.jwe
    }
  }

  async desencapsulate(encryptedEnvelope: IEncryptedEnvelope, publicKey: any): Promise<IDecryptedEnvelope> {
    this.logger.info(`About to call api-signer to decrypt...`)
    const jws = await this.signerAgent.decrypt(encryptedEnvelope)
    if (jws.thrown) {
      return { error: true, message: 'decryption failed' }
    }
    const jwk = JSON.parse(publicKey.key) as IJSONPublicKey
    this.logger.info(`Verifying JWS using JWK`)
    const verify = await this.signerAgent.verify(jws.message, jwk)
    this.logger.info(`Message verified, parsing...`)
    const clearTextMessage = JSON.parse(verify.payload)
    if (verify.thrown) {
      return { error: true, message: 'signature verification failed' }
    }

    return { error: false, message: clearTextMessage }
  }
}
