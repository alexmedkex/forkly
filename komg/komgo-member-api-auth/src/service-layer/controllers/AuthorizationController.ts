import { Route, Get, Header, Controller, Security, Query } from 'tsoa'

/**
 * Authorization Routes Class
 * @export
 * @class AuthorizationController
 * @extends {Controller}
 */
@Route('')
export class AuthorizationController extends Controller {
  @Security('middlewares', ['swagger', 'keycloak', 'permissions'])
  @Get('authorize')
  public async checkRolePermissions(
    @Query('baseUrl') baseUrl: string,
    @Query('method') method: string,
    @Query('path') path: string,
    @Header('Authorization') token?: string
  ): Promise<void> {
    return
  }

  @Security('middlewares', ['keycloak'])
  @Get('is-signed-in')
  public async isSignedIn(@Header('Authorization') token: string): Promise<void> {
    return
  }
}
