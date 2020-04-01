import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import Axios, { AxiosInstance } from 'axios'
import { inject, injectable } from 'inversify'

import { TYPES } from '../inversify/types'
import { ErrorName } from '../util/ErrorName'
import { RequestIdHandler } from '../util/RequestIdHandler'

import ISignerAgent from './ISignerAgent'
import { MessageTooLargeError } from './MessageTooLargeError'
import { IEncryptedEnvelope, IJSONPublicKey, MessageProcessingError } from './types'

const JSON_MIME_TYPE = 'application/json;charset=utf-8'
const HTTP_BAD_REQUEST = 400
const HTTP_PAYLOAD_TOO_LARGE = 413

@injectable()
export default class RsaSignerAgent implements ISignerAgent {
  private axios: AxiosInstance
  private logger = getLogger('RsaSignerAgent')

  constructor(
    @inject('api-signer-base-url') baseUrl: string,
    @inject('max-content-length') axiosMaxContentLength: number,
    @inject('request-timeout') requestTimeoutMs: number,
    @inject(TYPES.RequestIdHandler) requestIdHandler: RequestIdHandler | any
  ) {
    this.axios = Axios.create({
      baseURL: `${baseUrl}/v0`,
      timeout: requestTimeoutMs,
      headers: { 'Content-Type': JSON_MIME_TYPE },
      maxContentLength: axiosMaxContentLength
    })
    requestIdHandler.addToAxios(this.axios)
    this.logger.addLoggingToAxios(this.axios)
  }

  encrypt(payload: string, jwk: any): Promise<any> {
    return this.axios
      .post<string>('/rsa-signer/encrypt', {
        payload,
        jwk
      })
      .then(response => response.data)
      .catch(error => this.handleError(error))
  }

  decrypt(envelope: IEncryptedEnvelope): Promise<any> {
    return this.axios
      .post<string>('/rsa-signer/decrypt', {
        jwe: envelope.message
      })
      .then(response => response.data)
      .catch(error => this.handleError(error))
  }

  sign(payload: any): Promise<any> {
    return this.axios
      .post<string>('/rsa-signer/sign', {
        payload: JSON.stringify(payload)
      })
      .then(response => response.data)
      .catch(error => this.handleError(error))
  }

  verify(jws: any, jwk: IJSONPublicKey): Promise<string> {
    return this.axios
      .post<string>('/rsa-signer/verify', {
        jws,
        jwk
      })
      .then(response => response.data)
      .catch(error => this.handleError(error))
  }

  private handleError(error): Promise<any> {
    if (error.response) {
      this.logger.warn(ErrorCode.ConnectionMicroservice, ErrorName.SignerRequestFailed, error.response.data)
    }

    if (error.response && error.response.status === HTTP_BAD_REQUEST) {
      return Promise.reject(new MessageProcessingError(error.message))
    } else if (error.response && error.response.status === HTTP_PAYLOAD_TOO_LARGE) {
      return Promise.reject(new MessageTooLargeError(error.message))
    } else {
      return Promise.reject(error)
    }
  }
}
