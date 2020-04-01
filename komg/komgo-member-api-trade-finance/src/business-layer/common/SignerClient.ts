import { ISignerClient } from './ISignerClient'
import { injectable, inject } from 'inversify'
import axios from 'axios'
import { getLogger } from '@komgo/logging'
import { CONFIG } from '../../inversify/config'
import { ErrorCode } from '@komgo/error-utilities'
import { MicroserviceConnectionException } from '../../exceptions'
import { ErrorNames } from '../../exceptions/utils'

@injectable()
export default class SignerClient implements ISignerClient {
  private readonly logger = getLogger('SignerClient')
  private readonly signerUrl: string
  constructor(@inject(CONFIG.SignerUrl) signerUrl: string, private readonly retryDelay = 1000) {
    this.signerUrl = signerUrl
  }

  public async postTransaction(tx: any) {
    let result
    const url = `${this.signerUrl}/v0/one-time-signer/transaction`
    this.logger.info(`Posting to signer to deploy lc`, { url })
    try {
      result = await axios.post(url, tx)
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.SignerPostConnectionFailed,
        error.message,
        {
          transaction: tx
        },
        new Error().stack
      )
      throw new MicroserviceConnectionException(`Posting transaction failed.`)
    }

    return result
  }

  public async getKey() {
    let result
    const url = `${this.signerUrl}/v0/one-time-signer/key`
    this.logger.info('Get to signer to get key for lc.', { url })
    try {
      result = await axios.get(url)
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.SignerGetKeyFailed,
        error.message,
        new Error().stack
      )
      throw new MicroserviceConnectionException(`api-signer getKey failed.`)
    }

    return result
  }

  public async sign(data: any) {
    let result
    try {
      const url = `${this.signerUrl}/v0/signer/simple-sign`
      this.logger.info('Posting to signer to Sign.', { url })
      result = await axios.post(`${url}`, {
        payload: `${data}`
      })
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorNames.SignerSignTxFailed,
        error.message,
        new Error().stack
      )
      throw new MicroserviceConnectionException(`api-signer sign() failed.`)
    }
    return result
  }
}
