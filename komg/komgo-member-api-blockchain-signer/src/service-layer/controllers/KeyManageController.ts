import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { Body, Controller, Get, Post, Route, Security, Tags, Response } from 'tsoa'

import CompanyKeyProvider from '../../business-layer/key-management/CompanyKeyProvider'
import { ETHKeyManager } from '../../business-layer/key-management/ETHKeyManager'
import { IETHPublicData } from '../../business-layer/key-management/models/IETHKeyData'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'
import { ICreateEthKeyRequest } from '../request/key-manage/ICreateEthKeyRequest'
import VaultClient from '../../infrastructure/vault/VaultClient'

enum ERROR_MESSAGES {
  FAIL_CREATE_ETH_KEY = 'Failed to generate an ETH key',
  ETH_KEY_NOT_FOUND = 'ETH key missing'
}

/**
 * Key manager controller
 */
@Tags('Key management')
@Route('key-manage')
@provideSingleton(KeyManageController)
export class KeyManageController extends Controller {
  private readonly logger = getLogger('KeyManageController')

  constructor(
    @inject(TYPES.CompanyKeyProvider) private readonly companyKeyProvider: CompanyKeyProvider,
    @inject(TYPES.ETHKeyManager) private readonly ethKeyManager: ETHKeyManager
  ) {
    super()
  }

  /**
   * Create a public ETH key for this company.
   * If a key already exists it returns the existing key, unless "overwrite" field
   * in the request is not set to true.
   *
   * @param req parameters for the new ETH key to create
   * @returns a new key if it was created or an old key if already exists
   */
  @Response<HttpException>('500', 'Internal server error')
  @Security('internal')
  @Post('eth')
  public async createEthKey(@Body() req?: ICreateEthKeyRequest): Promise<IETHPublicData> {
    // return existing public key if it exists
    const pubKey = await this.companyKeyProvider.getETHKey('public')
    if (pubKey && !(req && req.overwrite)) {
      return pubKey
    }

    try {
      const keyData = await this.ethKeyManager.createNewKeyAndSave(req ? req.passphrase : null, req ? req.key : null)
      await this.companyKeyProvider.reloadETHKey(req ? req.passphrase : null)

      return keyData
    } catch (error) {
      this.logger.error(
        ErrorCode.ValidationHttpContent,
        ErrorName.ETHCreateKeyFailed,
        ERROR_MESSAGES.FAIL_CREATE_ETH_KEY,
        {
          action: ACTIONS.ETH_CREATE_NEW_KEY,
          message: error.message
        }
      )

      throw ErrorUtils.internalServerException(ErrorCode.ValidationHttpContent)
    }
  }

  /**
   * Get company's public ETH key.
   *
   * @returns public key of the company this node belongs to
   */
  @Security('withPermission', ['administration', 'readPublicKeys'])
  @Response<HttpException>('404', 'If a key does not exist')
  @Get('eth/public-key')
  public async getETHPublicKey(): Promise<IETHPublicData> {
    const key = await this.companyKeyProvider.getETHKey('public')

    if (!key) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.ETHKeyNotFound, ERROR_MESSAGES.ETH_KEY_NOT_FOUND, {
        action: ACTIONS.ETH_GET_KEY,
        message: ERROR_MESSAGES.ETH_KEY_NOT_FOUND
      })
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, ERROR_MESSAGES.ETH_KEY_NOT_FOUND)
    }

    return key
  }
}
