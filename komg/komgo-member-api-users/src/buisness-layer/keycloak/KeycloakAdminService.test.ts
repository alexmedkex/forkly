import 'jest'
import * as jestMock from 'jest-mock'
import 'reflect-metadata'
import KeycloakAdminClient from '@komgo/keycloak-admin'

function mock(classType) {
  const t = jestMock.getMetadata(classType)
  const t_inst = jestMock.getMetadata(new classType({}))
  t.members.prototype = t_inst
  const mockType = jestMock.generateFromMetadata(t)
  return new mockType()
}
let mockKeycloakAdminClient
mockKeycloakAdminClient = mock(KeycloakAdminClient)

import KeycloakAdminSevice from './KeycloakAdminService'

describe('KeycloakAdminSevice', () => {
  let keycloakAdminSevice
  beforeEach(async () => {
    keycloakAdminSevice = new KeycloakAdminSevice(
      async (): Promise<KeycloakAdminClient> => mockKeycloakAdminClient,
      false,
      'keycloakCorsAllowedOrigin',
      false,
      'smtpHost',
      'smtpPort',
      'smtpAuthUser',
      'smtpAuthPassword',
      false,
      'smtpFrom',
      false
    )
  })

  it('should create realm with ssl enabled', async () => {
    keycloakAdminSevice = new KeycloakAdminSevice(
      async (): Promise<KeycloakAdminClient> => mockKeycloakAdminClient,
      true,
      'keycloakCorsAllowedOrigin',
      false,
      'smtpHost',
      'smtpPort',
      'smtpAuthUser',
      'smtpAuthPassword',
      false,
      'smtpFrom',
      false
    )
    await keycloakAdminSevice.createRealm('name')
    expect(mockKeycloakAdminClient.realms.create).toBeCalledWith({
      realm: 'name',
      enabled: true,
      registrationAllowed: false,
      resetPasswordAllowed: false,
      verifyEmail: true,
      loginTheme: 'komgo',
      emailTheme: 'komgo',
      passwordPolicy: 'length(12) and specialChars(1) and upperCase(1) and lowerCase(1) and digits(1)',
      loginWithEmailAllowed: true,
      sslRequired: 'all',
      smtpServer: {
        host: 'smtpHost',
        port: 'smtpPort',
        auth: false,
        user: 'smtpAuthUser',
        password: 'smtpAuthPassword',
        from: 'smtpFrom',
        starttls: false,
        ssl: false
      }
    })
  })

  it('should create realm', async () => {
    await keycloakAdminSevice.createRealm('name')
    expect(mockKeycloakAdminClient.realms.create).toBeCalledWith({
      realm: 'name',
      enabled: true,
      registrationAllowed: false,
      resetPasswordAllowed: false,
      verifyEmail: true,
      loginTheme: 'komgo',
      emailTheme: 'komgo',
      passwordPolicy: 'length(12) and specialChars(1) and upperCase(1) and lowerCase(1) and digits(1)',
      loginWithEmailAllowed: true,
      smtpServer: {
        host: 'smtpHost',
        port: 'smtpPort',
        auth: false,
        user: 'smtpAuthUser',
        password: 'smtpAuthPassword',
        from: 'smtpFrom',
        starttls: false,
        ssl: false
      }
    })
  })

  it('should create roles', async () => {
    await keycloakAdminSevice.createRoles('name', ['role1'])
    expect(mockKeycloakAdminClient.roles.create).toBeCalledWith({ name: 'role1' })
  })

  it('should update events config', async () => {
    await keycloakAdminSevice.updateLoggingConfig('name')
    expect(mockKeycloakAdminClient.realms.updateEventsConfig).toBeCalledWith(
      { realm: 'name' },
      {
        eventsEnabled: true,
        adminEventsEnabled: true,
        adminEventsDetailsEnabled: true,
        eventsExpiration: 31536000
      }
    )
  })

  it('should create client', async () => {
    await keycloakAdminSevice.createClient('name', 'client1')
    expect(mockKeycloakAdminClient.clients.create).toBeCalledWith({
      clientId: 'client1',
      redirectUris: ['keycloakCorsAllowedOrigin'],
      webOrigins: ['keycloakCorsAllowedOrigin'],
      directAccessGrantsEnabled: true,
      publicClient: true
    })
  })

  it('should update client with tenant', async () => {
    mockKeycloakAdminClient.clientScopes.create.mockResolvedValue({ id: 'scope1' })
    mockKeycloakAdminClient.clients.find.mockResolvedValue([{ id: 'client1ID' }])
    await keycloakAdminSevice.updateClientWithTenantId('name', 'client1', 'staticid1')
    expect(mockKeycloakAdminClient.clients.addDefaultClientScope).toBeCalledWith({
      id: 'client1ID',
      clientScopeId: 'scope1'
    })
  })

  it('should create users', async () => {
    mockKeycloakAdminClient.users.create.mockResolvedValue({ id: 'user1' })
    mockKeycloakAdminClient.roles.find.mockResolvedValue([{ name: 'roleIDs', id: 'id' }])
    await keycloakAdminSevice.createUsers(
      'name',
      [
        {
          username: 'username',
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'email',
          roleIDs: ['roleIDs'],
          defaultPassword: 'defaultPassword'
        }
      ],
      false
    )
    expect(mockKeycloakAdminClient.users.addRealmRoleMappings).toBeCalledWith({
      id: 'user1',
      roles: [{ name: 'roleIDs', id: 'id' }]
    })
  })

  it('should check if realm has already been created', async () => {
    mockKeycloakAdminClient.realms.findOne.mockResolvedValue({})
    const result = await keycloakAdminSevice.realmExists('name')
    expect(result).toEqual(true)
  })

  it('should update admin role', async () => {
    mockKeycloakAdminClient.clients.find.mockResolvedValue([{ id: 'client1ID', clientId: 'realm-management' }])
    mockKeycloakAdminClient.roles.findOneByName.mockResolvedValue({ id: 'roleId' })
    await keycloakAdminSevice.updateUserAdminRole('name')
    expect(mockKeycloakAdminClient.roles.createCompositeById).toBeCalledWith({ id: 'roleId' }, [undefined])
  })

  it('should check if role belongs to user', async () => {
    mockKeycloakAdminClient.users.listRoleMappings.mockResolvedValue({ realmMappings: [] })
    await keycloakAdminSevice.userHasRole('realm', 'userId', 'role')
    expect(mockKeycloakAdminClient.users.listRoleMappings).toBeCalledWith({ id: 'userId' })
  })

  it('should assign role to user', async () => {
    await keycloakAdminSevice.assignRole('realm', 'userId', {})
    expect(mockKeycloakAdminClient.users.addRealmRoleMappings).toBeCalledWith({ id: 'userId', roles: [{}] })
  })

  it('should unassign role from user', async () => {
    await keycloakAdminSevice.unassignRole('realm', 'userId', {})
    expect(mockKeycloakAdminClient.users.delRealmRoleMappings).toBeCalledWith({ id: 'userId', roles: [{}] })
  })

  it('should get role by name', async () => {
    await keycloakAdminSevice.getRoleByName('realm', 'role')
    expect(mockKeycloakAdminClient.roles.findOneByName).toBeCalledWith({ name: 'role' })
  })

  it('should create role', async () => {
    await keycloakAdminSevice.createRole('realm', 'role')
    expect(mockKeycloakAdminClient.roles.create).toBeCalledWith({ name: 'role' })
  })

  it('should delete role', async () => {
    await keycloakAdminSevice.removeRole('realm', 'role')
    expect(mockKeycloakAdminClient.roles.delByName).toBeCalledWith({ name: 'role' })
  })

  it('should add view users permission to role', async () => {
    mockKeycloakAdminClient.clients.find.mockResolvedValue([{ clientId: 'realm-management' }])
    mockKeycloakAdminClient.clients.findRole.mockResolvedValue({})
    await keycloakAdminSevice.addViewUsersPermission('realm', 'role-id')
    expect(mockKeycloakAdminClient.roles.createCompositeById).toBeCalledWith({ id: 'role-id' }, [{}])
  })

  it('should add crud users permission to role', async () => {
    mockKeycloakAdminClient.clients.find.mockResolvedValue([{ clientId: 'realm-management' }])
    mockKeycloakAdminClient.clients.findRole.mockResolvedValue({})
    await keycloakAdminSevice.addCrudUsersPermission('realm', 'role-id')
    expect(mockKeycloakAdminClient.roles.createCompositeById).toBeCalledWith({ id: 'role-id' }, [{}])
  })

  it('should remove view users permission from role', async () => {
    mockKeycloakAdminClient.clients.find.mockResolvedValue([{ clientId: 'realm-management' }])
    mockKeycloakAdminClient.clients.findRole.mockResolvedValue({})
    await keycloakAdminSevice.removeViewUsersPermission('realm', 'role-id')
    expect(mockKeycloakAdminClient.roles.delCompositeById).toBeCalledWith({ id: 'role-id' }, [{}])
  })

  it('should remove crud users permission from role', async () => {
    mockKeycloakAdminClient.clients.find.mockResolvedValue([{ clientId: 'realm-management' }])
    mockKeycloakAdminClient.clients.findRole.mockResolvedValue({})
    await keycloakAdminSevice.removeCrudUsersPermission('realm', 'role-id')
    expect(mockKeycloakAdminClient.roles.delCompositeById).toBeCalledWith({ id: 'role-id' }, [{}])
  })

  it('should find users by role', async () => {
    await keycloakAdminSevice.findUsersByRole('realm', 'role')
    expect(mockKeycloakAdminClient.roles.findUsersByRole).toBeCalledWith({ name: 'role' })
  })

  it('should create user', async () => {
    await keycloakAdminSevice.createUser('realm', {})
    expect(mockKeycloakAdminClient.users.create).toBeCalledWith({ enabled: true })
  })

  it('should get user by id', async () => {
    await keycloakAdminSevice.findUser('realm', 'user-id')
    expect(mockKeycloakAdminClient.users.findOne).toBeCalledWith({ id: 'user-id' })
  })

  it('should get users', async () => {
    await keycloakAdminSevice.findUsers('realm')
    expect(mockKeycloakAdminClient.users.find).toBeCalled()
  })

  it('should reset password for user', async () => {
    await keycloakAdminSevice.resetUserPassword('realm', 'user-id', 'password')
    expect(mockKeycloakAdminClient.users.resetPassword).toBeCalledWith({
      realm: 'realm',
      id: 'user-id',
      credential: {
        temporary: false,
        type: 'password',
        value: 'password'
      }
    })
  })

  it('should get role mappings for user', async () => {
    await keycloakAdminSevice.listRoleMappings('realm', 'user-id')
    expect(mockKeycloakAdminClient.users.listRoleMappings).toBeCalledWith({ id: 'user-id' })
  })

  it('should execute email actions for user', async () => {
    await keycloakAdminSevice.executeActionsEmail('realm', 'user-id', [])
    expect(mockKeycloakAdminClient.users.executeActionsEmail).toBeCalledWith({ id: 'user-id', actions: [] })
  })
})
