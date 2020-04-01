import { Route, Get, Controller, Security, Tags } from 'tsoa'

import { provideSingleton } from '../../inversify/ioc'

/**
 * @export
 * @class MiscellaneousController
 * @extends {Controller}
 */
@Tags('Misc')
@Route('misc')
@provideSingleton(MiscellaneousController)
export class MiscellaneousController extends Controller {
  /**
   * @summary always returns HTTP 500 so in UI tests we can verify the System Error flow
   */
  @Security('signedIn')
  @Get('error-500')
  public async error500(): Promise<void> {
    throw {
      status: 500,
      response: {
        message: 'Internal Server Error',
        origin: 'api-users'
      }
    }
  }
}
