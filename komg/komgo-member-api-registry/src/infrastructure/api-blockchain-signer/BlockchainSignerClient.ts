import { getLogger } from '@komgo/logging'
import Axios from 'axios'
import { inject, injectable } from 'inversify'

import { IEthKeyResponse } from './IEthKeyResponse'

@injectable()
export default class BlockchainSignerClient {
  private readonly logger = getLogger('BlockchainSignerClient')

  constructor(@inject('api-blockchain-signer-url') private readonly blockchainSignerUrl: string) {}

  public async getEthKey(): Promise<IEthKeyResponse> {
    return this.getRequest<IEthKeyResponse>(
      '/v0/key-manage/eth/public-key',
      'Failed to fetch ETH key using the blockchain signer client'
    )
  }

  private async getRequest<T>(path: string, errorMessage: string): Promise<T> {
    try {
      this.logger.info('Sending get request to "%s" to get Eth Key', path)
      const response = await Axios.get(this.blockchainSignerUrl + path, { timeout: 10000 })
      return response.data
    } catch (error) {
      throw new Error(errorMessage)
    }
  }
}
