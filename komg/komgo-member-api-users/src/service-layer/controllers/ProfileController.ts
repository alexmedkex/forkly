import { ErrorCode as ErrCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { IUserProfileResponse } from '@komgo/types'
import { Controller, Get, Header, Route, Security, Tags, Response } from 'tsoa'

import { IUserSettingsDataAgent } from '../../data-layer/data-agent/UserSettingsDataAgent'
import { inject, provide } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import decode from '../../utils/decode'
import IDecodedJWT from '../../utils/IDecodedJWT'

/**
 * User Profile Class
 * @export
 * @class UsersProfile
 * @extends {Controller}
 */
@Tags('Profile')
@Route('profile')
@provide(ProfileController)
export class ProfileController extends Controller {
  constructor(@inject(TYPES.UserSettingsDataAgent) private readonly userSettingsDataAgent: IUserSettingsDataAgent) {
    super()
  }

  /**
   * @summary returns information about the user profile, settings, and company static ID
   */
  @Security('signedIn')
  @Response('400', 'invalid JWT token')
  @Get()
  public async getProfileByToken(@Header('Authorization') authHeader: string): Promise<IUserProfileResponse> {
    const decoded = this.getDecodedTokenFromAuthHeader(authHeader)
    const userId = decoded.sub

    return {
      id: userId,
      username: decoded.preferred_username,
      firstName: decoded.given_name,
      lastName: decoded.family_name,
      email: decoded.email,
      roles: decoded.realm_access.roles,
      company: process.env.COMPANY_STATIC_ID || '',
      settings: await this.userSettingsDataAgent.getSettings(userId)
    }
  }

  private getDecodedTokenFromAuthHeader(authHeader: string): IDecodedJWT {
    try {
      return decode(authHeader.substr('Bearer '.length))
    } catch (e) {
      throw ErrorUtils.badRequestException(ErrCode.Authorization, 'Invalid JWT', {})
    }
  }
}
