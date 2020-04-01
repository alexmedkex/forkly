import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { Controller, Route, Tags, Post, Body, Get, Query } from 'tsoa'

import { provideSingleton } from '../../inversify/ioc'
import { ICreateUserRequest, IHarborUser } from '../interfaces'

@Tags('Users')
@Route('users')
@provideSingleton(UsersController)
export class UsersController extends Controller {
  private readonly logger = getLogger('UsersController')

  /**
   * @summary create a user
   */
  @Post()
  public createUser(@Body() data: ICreateUserRequest): IHarborUser {
    this.logger.info('Create User', data)
    return {
      user_id: 'id-123',
      username: data.Username
    }
  }

  /**
   * @summary get users
   */
  @Get()
  public getUsers(@Query() username: string): IHarborUser[] {
    if (!username) {
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, 'username is empty', null)
    }
    this.logger.info(`Get Users. Query: username=${username}`)
    return [
      {
        user_id: 'id-123',
        username
      }
    ]
  }
}
