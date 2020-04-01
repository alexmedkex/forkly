import 'jest'
import * as jestMock from 'jest-mock'
import 'reflect-metadata'
import KeycloakAdminService from '../../buisness-layer/keycloak/KeycloakAdminService'

function mock(classType) {
  const mockType = jestMock.generateFromMetadata(jestMock.getMetadata(classType))
  return new mockType()
}

const mockKeycloakAdminService = mock(KeycloakAdminService)

import { KeycloakController } from './KeycloakController'

describe('KeycloakController', () => {
  let controller
  beforeAll(async () => {
    controller = new KeycloakController(mockKeycloakAdminService, '')
  })
  it('should create realm', async () => {
    await controller.configureKeycloak({
      realmName: 'string',
      allowedCorsOrigin: 'string',
      sslRequired: true,
      tenantId: 'string'
    })
    expect(mockKeycloakAdminService.updateClientWithTenantId).toBeCalledWith('string', '', 'string')
  })

  it('should create users', async () => {
    const users = [
      {
        username: 'string',
        firstName: 'string',
        lastName: 'string',
        email: 'string',
        roleIDs: ['string'],
        defaultPassword: 'string'
      }
    ]
    mockKeycloakAdminService.realmExists.mockResolvedValue(true)
    await controller.createKeycloakUsers({
      realmName: 'string',
      setTemporaryPasswords: true,
      users: users
    })
    expect(mockKeycloakAdminService.createUsers).toBeCalledWith('string', users, true)
  })
})
