import { ErrorCode } from '@komgo/error-utilities'
import { decrypt, encrypt, IJSONPublicKey, IJWKObject, sign, verify } from '@komgo/jose'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, HttpException, IValidationErrors } from '@komgo/microservice-config'
import { Body, Controller, Get, Post, Response, Route, SuccessResponse } from 'tsoa'

import CompanyKeyProvider from '../../business-layer/key-management/CompanyKeyProvider'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'
import { CryptographyFunction, CryptographyType, Metric } from '../../utils/Metrics'
import { IRsaDecryptRequest, IRsaEncryptRequest, IRsaSignRequest, IVerifyRequest } from '../request/rsa-signer'
import { IRSADecryptResponse, IRsaEncryptResponse, IRsaSignResponse, IVerifyResponse } from '../responses/rsa-signer'
import { HttpServerMessages } from '../utils/HttpConstants'

enum ERROR_MESSAGES {
  FAIL_DECRYPT = 'Failed to decrypt',
  FAIL_ENCRYPT = 'Failed to encrypt',
  FAIL_SIGN = 'Failed to sign',
  FAIL_VERIFY = 'Failed to verify'
}

/**
 * RsaSignerController Class
 * @export
 * @class RsaSignerController
 * @extends {Controller}
 */
@Route('rsa-signer')
@provideSingleton(RsaSignerController)
export class RsaSignerController extends Controller {
  private readonly logger = getLogger('RsaSignerController')
  constructor(@inject(TYPES.CompanyKeyProvider) private readonly companyKeyProvider: CompanyKeyProvider) {
    super()
  }

  /**
   * Get active RSA key
   *
   * @summary Returns base64 encoded JSON with a public key
   */
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Get('public-key')
  @SuccessResponse('200', 'GET')
  public async getPublicKey(): Promise<IJSONPublicKey> {
    return this.companyKeyProvider.getRSAKey('public') as Promise<IJSONPublicKey>
  }

  /**
   * Encrypts payload using active RSA key
   *
   * @summary Encrypts payload using provided key
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Post('encrypt')
  @SuccessResponse('200', 'POST')
  public async encrypt(@Body() request: IRsaEncryptRequest): Promise<IRsaEncryptResponse> {
    try {
      this.logger.metric({
        [Metric.CryptographyType]: CryptographyType.Rsa,
        [Metric.CryptographyFunction]: CryptographyFunction.Encrypt
      })
      return { jwe: await encrypt(request.jwk, request.payload) }
    } catch (error) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.RSAEncrypt, ERROR_MESSAGES.FAIL_ENCRYPT, {
        key: request.jwk,
        action: ACTIONS.RSA_ENCRYPT,
        message: error.message
      })

      const validationError: IValidationErrors = {
        jwk: ['unsupported key type']
      }
      throw ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpContent,
        ERROR_MESSAGES.FAIL_ENCRYPT,
        validationError
      )
    }
  }

  /**
   * Decrypts JWE using our own private key
   *
   * @summary Decrypts JWE using our own private key
   */
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Post('decrypt')
  @SuccessResponse('200', 'POST')
  public async decrypt(@Body() request: IRsaDecryptRequest): Promise<IRSADecryptResponse> {
    const key = (await this.companyKeyProvider.getRSAKey()) as IJWKObject

    try {
      const decryptedData = await decrypt(key, request.jwe)
      this.logger.metric({
        [Metric.CryptographyType]: CryptographyType.Rsa,
        [Metric.CryptographyFunction]: CryptographyFunction.Decrypt
      })
      return { message: decryptedData.payload.toString() }
    } catch (error) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.RSADecrypt, ERROR_MESSAGES.FAIL_DECRYPT, {
        encryption: '[redacted]',
        action: ACTIONS.RSA_DECRYPT,
        message: error.message
      })
      throw ErrorUtils.internalServerException(ErrorCode.ValidationHttpContent)
    }
  }

  /**
   * Signs payload using our own private key
   *
   * @summary Signs payload using our own private key
   */
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Post('sign')
  @SuccessResponse('200', 'POST')
  public async sign(@Body() request: IRsaSignRequest): Promise<IRsaSignResponse> {
    const key = (await this.companyKeyProvider.getRSAKey()) as IJWKObject

    try {
      const resp = { jws: await sign(key, request.payload) }
      this.logger.metric({
        [Metric.CryptographyType]: CryptographyType.Rsa,
        [Metric.CryptographyFunction]: CryptographyFunction.Sign
      })
      return resp
    } catch (error) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.RSASign, ERROR_MESSAGES.FAIL_SIGN, {
        action: ACTIONS.RSA_SIGN,
        message: error.message
      })
      throw ErrorUtils.internalServerException(ErrorCode.ValidationHttpContent)
    }
  }

  /**
   * Verifies payload using provided key
   *
   * @summary Verifies payload using provided key
   */
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Post('verify')
  @SuccessResponse('200', 'POST')
  public async verify(@Body() request: IVerifyRequest): Promise<IVerifyResponse> {
    try {
      const result = await verify(request.jwk, request.jws)
      const resp: IVerifyResponse = {
        protected: result.protected,
        header: result.header,
        key: result.key,
        payload: result.payload.toString()
      }
      this.logger.metric({
        [Metric.CryptographyType]: CryptographyType.Rsa,
        [Metric.CryptographyFunction]: CryptographyFunction.Verify
      })
      return resp
    } catch (error) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.RSACheckSignature, ERROR_MESSAGES.FAIL_VERIFY, {
        key: request.jwk,
        signature: request.jws,
        action: ACTIONS.RSA_VERIFY,
        message: error.message
      })

      const validationError: IValidationErrors = {
        jws: ['Invalid signature']
      }
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, ERROR_MESSAGES.FAIL_VERIFY, validationError)
    }
  }
}
