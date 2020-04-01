import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { IConfigureKeycloakRequest, ICreateKeycloakUsersRequest } from '@komgo/types'
import { inject } from 'inversify'
import { Route, Post, Body, Controller, Security, Tags, Response } from 'tsoa'

import { IKeycloakAdminService } from '../../buisness-layer/keycloak/KeycloakAdminService'
import { CONFIG } from '../../inversify/config'
import { provide } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'

/**
 * @export
 * @class KeycloakController
 * @extends {Controller}
 */
@Tags('Keycloak')
@Route('keycloak')
@provide(KeycloakController)
export class KeycloakController extends Controller {
  constructor(
    @inject(TYPES.KeycloakAdminService) private readonly keycloakAdminService: IKeycloakAdminService,
    @inject(CONFIG.clientId) private readonly clientId: string
  ) {
    super()
  }

  /**
   * @summary configure keycloak realm
   */
  @Security('internal')
  @Post('configure')
  @Response('204', 'Realm created')
  @Response('409', 'Realm already exists')
  public async configureKeycloak(@Body() request: IConfigureKeycloakRequest): Promise<void> {
    try {
      await this.keycloakAdminService.createRealm(request.realmName)
    } catch (e) {
      if (e.response.status === 409) {
        throw ErrorUtils.conflictException(
          ErrorCode.ValidationHttpContent,
          `Realm "${request.realmName}" already exists`
        )
      } else {
        throw e
      }
    }
    await this.keycloakAdminService.updateLoggingConfig(request.realmName)
    await this.keycloakAdminService.createClient(request.realmName, this.clientId)
    await this.keycloakAdminService.createRoles(request.realmName, [
      'userAdmin',
      'kycAnalyst',
      'complianceOfficer',
      'tradeFinanceOfficer',
      'relationshipManager',
      'middleAndBackOfficer',
      'kapsuleAdmin'
    ])
    await this.keycloakAdminService.updateUserAdminRole(request.realmName)
    await this.keycloakAdminService.updateClientWithTenantId(request.realmName, this.clientId, request.tenantId)
  }

  @Security('internal')
  @Post('users')
  @Response('204', 'Users created')
  @Response('404', 'Realm not found')
  public async createKeycloakUsers(@Body() request: ICreateKeycloakUsersRequest): Promise<void> {
    const existingRealm = await this.keycloakAdminService.realmExists(request.realmName)
    if (!existingRealm) {
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, `Realm "${request.realmName}" does not exist`)
    }
    await this.keycloakAdminService.createUsers(request.realmName, request.users, request.setTemporaryPasswords)
  }
}
