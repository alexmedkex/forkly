import 'reflect-metadata'
import { IConfigureKeycloakRequest, ICreateKeycloakUsersRequest } from '@komgo/types'
import { ErrorCode } from '@komgo/error-utilities'
import KcAdminClient from '@komgo/keycloak-admin'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { v4 as uuid4 } from 'uuid'

import axios from 'axios'

import { startService, stopService } from './run-test-server'

jest.setTimeout(1000 * 60 * 5)

async function start() {
  try {
    await startService()
  } catch (e) {
    console.log(e)
  }
}

describe('Keycloak Configuration', () => {
  const realmName = `test-${uuid4()}`
  const tenant = uuid4()
  const keycloakAuthUrl = process.env.KEYCLOAK_AUTH_URL
  const usersBaseUrl = 'http://localhost:8081/v0'
  beforeAll(async () => {
    await start()
  })
  afterAll(async () => {
    await stopService()
  })

  it('should create realm', async () => {
    const response = await axios.post(`${usersBaseUrl}/keycloak/configure`, {
      realmName: realmName,
      allowedCorsOrigin: 'http://some-url/',
      sslRequired: true,
      tenantId: tenant
    })
    expect(response.status).toEqual(204)
    const kcAdminClient = new KcAdminClient({ baseUrl: keycloakAuthUrl })
    await kcAdminClient.auth({
      username: process.env.KEYCLOAK_USER,
      password: process.env.KEYCLOAK_PASSWORD,
      grantType: 'password',
      clientId: 'admin-cli'
    })
    const resultingRealm = await kcAdminClient.realms.findOne({
      realm: realmName
    })
    expect(resultingRealm).toHaveProperty('loginTheme', 'komgo')
    kcAdminClient.setConfig({
      realmName
    })
    const resultingClients = await kcAdminClient.clients.find()
    expect(resultingClients.map(item => item.clientId)).toContain('web-app')
    const resultingRoles = await kcAdminClient.roles.find()
    expect(resultingRoles.map(item => item.name)).toContain('relationshipManager')
  })

  it('should not  create realm with existing name', async () => {
    await expect(
      axios.post(`${usersBaseUrl}/keycloak/configure`, {
        realmName: realmName,
        allowedCorsOrigin: 'http://some-url/',
        sslRequired: true,
        tenantId: tenant
      })
    ).rejects.toThrowError(
      ErrorUtils.conflictException(ErrorCode.ValidationHttpContent, `Request failed with status code 409`)
    )
  })

  it('should not create user for non-existent realm', async () => {
    const users = [
      {
        username: 'username',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'string@112.com',
        roleIDs: ['kapsuleAdmin'],
        defaultPassword: 'b4_V#7k[%NVr'
      }
    ]

    await expect(
      axios.post(`${usersBaseUrl}/keycloak/users`, {
        realmName: tenant,
        setTemporaryPasswords: true,
        users
      })
    ).rejects.toThrowError(
      ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, `Request failed with status code 404`)
    )
  })

  it('should create user', async () => {
    const users = [
      {
        username: 'username',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'string@112.com',
        roleIDs: ['userAdmin'],
        defaultPassword: 'b4_V#7k[%NVr'
      }
    ]
    const response = await axios.post(`${usersBaseUrl}/keycloak/users`, {
      realmName,
      setTemporaryPasswords: false,
      users
    })
    expect(response.status).toEqual(204)
    const kcAdminClient = new KcAdminClient({ baseUrl: keycloakAuthUrl })
    await kcAdminClient.auth({
      username: process.env.KEYCLOAK_USER,
      password: process.env.KEYCLOAK_PASSWORD,
      grantType: 'password',
      clientId: 'admin-cli'
    })
    kcAdminClient.setConfig({
      realmName
    })
    const resultingUsers = await kcAdminClient.users.find()
    expect(resultingUsers.length).toEqual(1)
    expect(resultingUsers[0]).toHaveProperty('lastName', 'lastName')
  })
  it('should authenticate user', async () => {
    const formUrlEncoded = data =>
      Object.keys(data).reduce((result, key) => `${result}&${key}=${encodeURIComponent(data[key])}`, '')
    await axios.post(
      `${keycloakAuthUrl}/realms/${realmName}/protocol/openid-connect/token`,
      formUrlEncoded({
        username: 'username', // username
        password: 'b4_V#7k[%NVr', // password
        grant_type: 'password',
        client_id: 'web-app'
      }),
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' }
      }
    )
  })
})
