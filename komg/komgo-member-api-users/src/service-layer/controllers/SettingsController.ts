import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { IUserSettings, IUserSettingsRequest } from '@komgo/types'
import * as _ from 'lodash'
import { Controller, Header, Body, Get, Path, Put, Response, Route, Security, Tags } from 'tsoa'

import { IUserSettingsDataAgent } from '../../data-layer/data-agent/UserSettingsDataAgent'
import { inject, provide } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import decode from '../../utils/decode'
import IDecodedJWT from '../../utils/IDecodedJWT'

/**
 * User Settings Routes Class
 * @export
 * @class SettingsController
 * @extends {Controller}
 */
@Tags('Settings')
@Route('users')
@provide(SettingsController)
export class SettingsController extends Controller {
  constructor(@inject(TYPES.UserSettingsDataAgent) private readonly userSettingsDataAgent: IUserSettingsDataAgent) {
    super()
  }

  /**
   * @summary returns settings for user by user ID
   */
  @Security('internal')
  @Response('404', 'User not found')
  @Get('{userId}/settings')
  public async GetSettingsByUserId(@Path() userId: string): Promise<IUserSettings> {
    return this.userSettingsDataAgent.getSettings(userId)
  }

  /**
   * @summary Update user settings
   */
  @Security('signedIn')
  @Response('400', 'Missing field')
  @Response('400', 'User ID passed in the route belongs to another user')
  @Response('403', 'Invalid JWT')
  @Put('{userId}/settings')
  public async UpdateSettingsByUserId(
    @Path('userId') userId: string,
    @Header('Authorization') authHeader: string,
    @Body() request: IUserSettingsRequest
  ): Promise<IUserSettings> {
    const decoded = this.getDecodedTokenFromAuthHeader(authHeader)
    const tokenUserId = decoded.sub

    if (userId !== tokenUserId) {
      throw ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpContent,
        'User ID passed in the route belongs to another user',
        null
      )
    }

    const settings: IUserSettings = { userId, ...request }
    return this.userSettingsDataAgent.updateSettings(userId, settings)
  }

  private getDecodedTokenFromAuthHeader(authHeader: string): IDecodedJWT {
    try {
      return decode(authHeader.substr('Bearer '.length))
    } catch (e) {
      throw ErrorUtils.badRequestException(ErrorCode.Authorization, 'Invalid JWT', {})
    }
  }
}
