import 'reflect-metadata'
const mockKeycloak = jest.fn(() => ({ connected: true }))
const mockService = jest.fn(() => ({ connected: true }))

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: {
    checkKeycloak: mockKeycloak,
    checkService: mockService
  }
}))

import { HealthController } from './HealthController'

describe('HealthController', () => {
  let healthController
  let presaveKeycloakUrl
  let presaveRealmName
  beforeAll(() => {
    presaveKeycloakUrl = process.env.KEYCLOAK_SERVER_AUTH_URL
    presaveRealmName = process.env.KEYCLOAK_REALM_NAME
    healthController = new HealthController()
  })

  afterAll(() => {
    process.env.KEYCLOAK_SERVER_AUTH_URL = presaveKeycloakUrl
    process.env.KEYCLOAK_REALM_NAME = presaveRealmName
  })

  it('should return undefined', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should return all connections with status OK', async () => {
    process.env.KEYCLOAK_SERVER_AUTH_URL = 'KEYCLOAK_SERVER_AUTH_URL'
    process.env.KEYCLOAK_REALM_NAME = 'KEYCLOAK_REALM_NAME'

    const result = await healthController.Ready()
    expect(mockKeycloak).toHaveBeenCalledWith('KEYCLOAK_SERVER_AUTH_URL', 'KEYCLOAK_REALM_NAME')
    expect(result).toEqual({
      keycloak: 'OK',
      apiRoles: 'OK'
    })
  })

  it('should return keycloak status with error', async () => {
    mockKeycloak.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      status: 500,
      response: {
        keycloak: 'error',
        apiRoles: 'OK'
      }
    })
  })
})
