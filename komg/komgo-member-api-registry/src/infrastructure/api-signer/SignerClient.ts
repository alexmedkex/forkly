import { IJSONPublicKey, IJWKObject } from '@komgo/jose'
import { getLogger } from '@komgo/logging'
import Axios from 'axios'
import { inject, injectable } from 'inversify'

@injectable()
export default class SignerClient {
  private readonly logger = getLogger('SignerClient')

  constructor(@inject('api-signer-url') private readonly signerUrl: string) {}

  public async getRSAKey(): Promise<IJSONPublicKey> {
    return this.getRequest<IJSONPublicKey>(
      '/v0/key-manage/rsa/public-key',
      'Failed to get RSA key using the signer client'
    )
  }

  private async getRequest<T>(path: string, errorMessage: string): Promise<T> {
    try {
      this.logger.info('Sending GET request to "%s" to get RSA key', path)
      const response = await Axios.get(this.signerUrl + path, { timeout: 10000 })
      return response.data
    } catch (error) {
      throw new Error(errorMessage)
    }
  }
}
