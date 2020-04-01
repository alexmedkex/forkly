import 'reflect-metadata'
const mockKeycloak = jest.fn(() => ({ connected: true }))
const mockService = jest.fn(() => ({ connected: true }))
const mockMongo = jest.fn(() => ({ connected: true }))

jest.mock('@komgo/health-check', () => ({
  CheckerInstance: {
    checkKeycloak: mockKeycloak,
    checkService: mockService,
    checkMongoDB: mockMongo
  }
}))

import { HealthController } from './HealthController'

describe('HealthController', () => {
  let healthController
  let presaveKeycloakUrl
  let presaveRealmName

  beforeAll(() => {
    presaveKeycloakUrl = process.env.KEYCLOAK_AUTH_URL
    presaveRealmName = process.env.KEYCLOAK_REALM_NAME
    healthController = new HealthController()
    healthController.keycloakAuthUrl = 'KEYCLOAK_AUTH_URL'
  })

  afterAll(() => {
    process.env.KEYCLOAK_AUTH_URL = presaveKeycloakUrl
    process.env.KEYCLOAK_REALM_NAME = presaveRealmName
  })

  it('should return undefined', async () => {
    const result = await healthController.Healthz()
    expect(result).toEqual(undefined)
  })

  it('should return all connections with status OK', async () => {
    process.env.KEYCLOAK_AUTH_URL = 'KEYCLOAK_AUTH_URL'
    process.env.KEYCLOAK_REALM_NAME = 'KEYCLOAK_REALM_NAME'

    const result = await healthController.Ready()
    expect(mockKeycloak).toHaveBeenCalledWith('KEYCLOAK_AUTH_URL', 'KEYCLOAK_REALM_NAME')
    expect(result).toEqual({
      keycloak: 'OK',
      apiRoles: 'OK',
      mongo: 'OK'
    })
  })

  it('should return keycloak status with error', async () => {
    mockKeycloak.mockImplementation(() => ({ connected: false, error: 'error' }))
    await expect(healthController.Ready()).rejects.toEqual({
      response: {
        keycloak: 'error',
        apiRoles: 'OK',
        mongo: 'OK'
      },
      status: 500
    })
  })
})
