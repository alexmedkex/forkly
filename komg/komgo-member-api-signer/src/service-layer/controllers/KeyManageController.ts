import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'
import { IJSONPublicKey, IJWKObject } from '@komgo/jose'
import { getLogger } from '@komgo/logging'
import { Route, Get, Post, Body, Controller, Security, Tags, Response, SuccessResponse } from 'tsoa'

import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'
import { ICreateRsaKeyRequest } from '../request/key-manage/ICreateRsaKeyRequest'
import { HttpServerMessages } from '../utils/HttpConstants'
import { RsaKeyManager } from '../../business-layer/key-management/RsaKeyManager'
import CompanyKeyProvider from '../../business-layer/key-management/CompanyKeyProvider'

enum ERROR_MESSAGES {
  FAIL_CREATE_RSA_KEY = 'Failed to generate a RSA key',
  RSA_KEY_NOT_FOUND = 'RSA key missing'
}

/**
 * OneTimeSignController Class
 * @export
 * @class OneTimeSignController
 * @extends {Controller}
 */
@Tags('key-manage')
@Route('key-manage')
@provideSingleton(KeyManageController)
export class KeyManageController extends Controller {
  private readonly logger = getLogger('KeyManageController')

  constructor(
    @inject(TYPES.CompanyKeyProvider) private readonly companyKeyProvider: CompanyKeyProvider,
    @inject(TYPES.RsaKeyManager) private readonly rsaKeyManager: RsaKeyManager
  ) {
    super()
  }

  /**
   * Create a RSA key for this company.
   * If a key already exists it returns the existing key, unless "overwrite" field
   * in the request is not set to true.
   *
   * @param req parameters for the new RSA key to create
   *
   * @returns a new key if it was created or an old key if already exists
   */
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('internal')
  @Post('rsa')
  @SuccessResponse('201', 'POST')
  public async createRSAKey(@Body() req?: ICreateRsaKeyRequest): Promise<IJSONPublicKey> {
    const reqKey = req ? req.key : null
    const reqPassphrase = req ? req.passphrase : null
    const reqOverwrite = req ? req.overwrite : null
    // return existing public key if it exists
    let pubKey = (await this.companyKeyProvider.getRSAKey('public')) as IJSONPublicKey

    if (pubKey && !reqOverwrite) {
      return pubKey
    }

    try {
      const key: IJWKObject = await this.rsaKeyManager.createKey(reqKey)

      // check again whether key exists to avoid race conditions
      pubKey = (await this.companyKeyProvider.getRSAKey('public')) as IJSONPublicKey

      if (pubKey && !reqOverwrite) {
        return pubKey
      }

      const keyData: IJSONPublicKey = await this.rsaKeyManager.saveAndReturnKey(key, reqPassphrase)
      await this.companyKeyProvider.reloadRSAKey(reqPassphrase)

      return keyData
    } catch (error) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.RSACreateKey, ERROR_MESSAGES.FAIL_CREATE_RSA_KEY, {
        action: ACTIONS.RSA_CREATE_KEY,
        message: error.message
      })

      ErrorUtils.internalServerException(ErrorCode.ValidationHttpContent)
    }
  }

  /**
   * Get company's public RSA key
   *
   * @summary Get rsa public key
   */
  @Response<HttpException>('404', HttpServerMessages.NotFound)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['administration', 'readPublicKeys'])
  @Get('rsa/public-key')
  @SuccessResponse('200', 'GET')
  public async getRSAPublicKey(): Promise<IJSONPublicKey> {
    const key = (await this.companyKeyProvider.getRSAKey('public')) as IJSONPublicKey

    if (!key) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.RSAKeyNotFound, ERROR_MESSAGES.RSA_KEY_NOT_FOUND, {
        action: ACTIONS.RSA_GET_KEY,
        message: ERROR_MESSAGES.RSA_KEY_NOT_FOUND
      })
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, ERROR_MESSAGES.RSA_KEY_NOT_FOUND)
    }

    return key
  }
}
