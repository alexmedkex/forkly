import { ErrorCode as ErrCode } from '@komgo/error-utilities'
import { ErrorUtils as ErrUtils } from '@komgo/microservice-config'
import { IUser, IUserCreateRequest, IUserResponse, RequiredUserActions, IChangePasswordRequest } from '@komgo/types'
import axios from 'axios'
import * as _ from 'lodash'
import { Body, Controller, Get, Path, Post, Put, Query, Header, Response, Route, Security, Tags } from 'tsoa'

import { IKeycloakAdminService } from '../../buisness-layer/keycloak/KeycloakAdminService'
import RolesClient from '../../infrastructure/roles/RolesClient'
import { CONFIG } from '../../inversify/config'
import { inject, provide } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import decode from '../../utils/decode'
import IDecodedJWT from '../../utils/IDecodedJWT'

const KEYCLOAK_DEFAULT_REALM_ROLES = ['uma_authorization', 'offline_access']

export interface IUserWithRoles extends IUser {
  roles: Array<{}>
}

/**
 * User Routes Class
 * @export
 * @class UsersController
 * @extends {Controller}
 */
@Tags('Users')
@Route('users')
@provide(UsersController)
export class UsersController extends Controller {
  constructor(
    @inject(CONFIG.realm) private readonly realmName: string,
    @inject(TYPES.KeycloakAdminService) private readonly keycloakAdminService: IKeycloakAdminService,
    @inject(TYPES.KeycloakAuthUrl) private readonly keycloakAuthUrl: string,
    @inject(CONFIG.rolesBaseUrl) private readonly rolesBaseUrl: string
  ) {
    super()
  }

  /**
   * @summary registers new User
   */
  @Security('internal')
  @Response('400', 'user creation error')
  @Post()
  public async RegisterNewUser(@Body() request: IUserCreateRequest): Promise<IUserResponse> {
    try {
      const { id, username, firstName, lastName, createdTimestamp, email } = await this.keycloakAdminService.createUser(
        this.realmName,
        request
      )

      if (request.requiredActions && request.requiredActions.length > 0) {
        const actions = []
        if (request.requiredActions.find(item => item === RequiredUserActions.VERIFY_EMAIL)) {
          actions.push(RequiredUserActions.VERIFY_EMAIL)
        }
        if (request.requiredActions.find(item => item === RequiredUserActions.UPDATE_PASSWORD)) {
          actions.push(RequiredUserActions.UPDATE_PASSWORD)
        }
        await this.keycloakAdminService.executeActionsEmail(this.realmName, id, actions)
      }

      return { id, username, firstName, lastName, createdAt: createdTimestamp, email }
    } catch (e) {
      throw ErrUtils.badRequestException(ErrCode.ValidationHttpContent, JSON.stringify(e.body), {})
    }
  }

  /**
   * @summary returns user by ID
   */
  @Security('withPermission', ['administration', 'manageUsers', 'read'])
  @Response('404', 'User not found')
  @Get('{userId}')
  public async GetUserById(@Path() userId: string): Promise<IUserResponse> {
    const user = await this.keycloakAdminService.findUser(this.realmName, userId)
    if (user === null) {
      throw ErrUtils.notFoundException(ErrCode.ValidationHttpContent, `User with ID ${userId} doesn't exist`)
    }
    const { id, username, firstName, lastName, createdTimestamp, email } = user

    return { id, username, firstName, lastName, createdAt: createdTimestamp, email }
  }

  /**
   * @summary reset password for user
   */
  @Security('signedIn')
  @Response('403', 'Modifying other user profile forbidden.')
  @Response('422', 'Wrong current password.')
  @Response('422', 'Password missmatch.')
  @Put('{userId}/reset-password')
  public async ResetPassword(
    @Header('Authorization') jwt: string,
    @Path() userId: string,
    @Body() password: IChangePasswordRequest
  ): Promise<void> {
    const decoded: IDecodedJWT = decode(jwt.substr(7))
    if (decoded.sub !== userId) {
      throw ErrUtils.unauthorizedException(ErrCode.Authorization, `Modifying other user profile forbidden.`)
    }
    if (password.newPassword !== password.confirmNewPassword) {
      throw ErrUtils.unprocessableEntityException(ErrCode.ValidationHttpContent, `Password missmatch.`, {
        data: { confirmNewPassword: ['Password missmatch.'] }
      })
    }
    try {
      const formUrlEncoded = data =>
        Object.keys(data).reduce((result, key) => `${result}&${key}=${encodeURIComponent(data[key])}`, '')
      await axios.post(
        `${this.keycloakAuthUrl}/realms/${this.realmName}/protocol/openid-connect/token`,
        formUrlEncoded({
          username: decoded.preferred_username, // username
          password: password.currentPassword, // password
          grant_type: 'password',
          client_id: 'web-app'
        }),
        {
          headers: { 'content-type': 'application/x-www-form-urlencoded' }
        }
      )
    } catch (e) {
      throw ErrUtils.unprocessableEntityException(ErrCode.Authorization, `Wrong current password.`, {
        data: { currentPassword: ['Wrong current password.'] }
      })
    }

    try {
      await this.keycloakAdminService.resetUserPassword(this.realmName, userId, password.newPassword)
    } catch (e) {
      throw ErrUtils.unprocessableEntityException(ErrCode.ValidationHttpContent, `Weak password.`, {
        data: { newPassword: ['Weak password.'] }
      })
    }
  }

  /**
   * Return list of users
   *
   * This route is available for any signed in user
   * because there are multiple cases where we want to display a list of users
   * For example, when assigning a task or when assigning users to a role
   *
   * @summary returns users
   * @param {string} productId filer by role.permittedActions.product.id
   * @param {string} actionId filer by role.permittedActions.action.id. Allowed only if productId id passed
   * @param {boolean} withRoles if true, response will have 'roles' array with a list of assigned roles
   */
  @Security('signedIn')
  @Response('400', 'actionId can be used only with productId parameter')
  @Response('404', 'Role with current permissions not found')
  @Get()
  public async GetUsers(
    @Query('productId') productId?: string,
    @Query('actionId') actionId?: string,
    @Query('withRoles') withRoles?: boolean
  ): Promise<IUserResponse[]> {
    let users
    if (actionId && !productId) {
      throw ErrUtils.badRequestException(
        ErrCode.Authorization,
        'actionId can be used only with productId parameter',
        {}
      )
    }
    if (!productId && !actionId) {
      users = await this.keycloakAdminService.findUsers(this.realmName)
    } else {
      let url = `${this.rolesBaseUrl}/v0/roles?productId=${productId}`
      if (actionId) {
        url = `${url}&actionId=${actionId}`
      }
      const receivedRoles: any = await axios.get(url)
      if (receivedRoles.data.length === 0) {
        throw ErrUtils.notFoundException(ErrCode.Authorization, 'Role with current permissions not found')
      }
      users = await this.getUsersByRoles(receivedRoles)
    }
    if (withRoles) {
      users = await this.getRolesForUsers(users)
    }
    return users.map(({ id, username, firstName, lastName, createdTimestamp, email, roles }) => ({
      id,
      username,
      firstName,
      lastName,
      createdAt: createdTimestamp,
      email,
      ...(withRoles ? { roles } : {})
    }))
  }

  private async getRolesForUsers(users: IUser[]): Promise<IUserWithRoles[]> {
    return Promise.all(
      users.map(async obj => {
        const roleMappings = await this.keycloakAdminService.listRoleMappings(this.realmName, obj.id)
        const rolesList = roleMappings.realmMappings
          .map(j => j.name)
          // exclude default realm roles
          .filter(roleName => KEYCLOAK_DEFAULT_REALM_ROLES.indexOf(roleName) === -1)
        return { ...obj, roles: rolesList }
      })
    )
  }

  private async getUsersByRoles(roles) {
    const userResponses = await Promise.all<IUserResponse[]>(
      roles.data.map(async item => {
        try {
          return await this.keycloakAdminService.findUsersByRole(this.realmName, item.id)
        } catch (e) {
          // ignore non-existent record
        }
      })
    )
    return _.unionBy(_.flatten(userResponses.filter(item => item !== undefined)), 'id')
  }
}
