import KeycloakAdminClient from '@komgo/keycloak-admin'
import { ICreateKeycloakUser } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { CONFIG } from '../../inversify/config'
import { TYPES } from '../../inversify/types'

export interface IKeycloakAdminService {
  createRealm(realmName: string)
  createRoles(realmName: string, roles: string[])
  createClient(realmName: string, clientId: string)
  createUsers(realmName: string, users: ICreateKeycloakUser[], temporaryPasswords: boolean)
  realmExists(realmName: string): Promise<boolean>
  updateUserAdminRole(realmName: string)
  updateLoggingConfig(realmName: string)
  updateClientWithTenantId(realmName: string, clientId: string, tenantId: string)
  userHasRole(realmName: string, userId: string, roleName: string)
  assignRole(realmName: string, userId: string, role)
  unassignRole(realmName: string, userId: string, role)
  getRoleByName(realmName: string, roleName: string)
  createRole(realmName: string, roleName: string)
  removeRole(realmName: string, roleName: string)
  addViewUsersPermission(realmName: string, roleId: string)
  removeViewUsersPermission(realmName: string, roleId: string)
  addCrudUsersPermission(realmName: string, roleId: string)
  removeCrudUsersPermission(realmName: string, roleId: string)
  findUsersByRole(realmName: string, roleName: string)
  listRoleMappings(realmName: string, userId: string)
  createUser(realmName: string, user)
  findUser(realmName: string, userId: string)
  findUsers(realmName: string)
  resetUserPassword(realmName: string, userId: string, password: string)
  executeActionsEmail(realmName: string, userId: string, actions)
}

@injectable()
export default class KeycloakAdminService implements IKeycloakAdminService {
  constructor(
    @inject(TYPES.KeycloakAdminClient) private readonly kcAdminClient: () => Promise<KeycloakAdminClient>,
    @inject(CONFIG.keycloakSsl) private readonly keycloakSsl: boolean,
    @inject(CONFIG.keycloakCorsAllowedOrigin) private readonly keycloakCorsAllowedOrigin: string,
    @inject(CONFIG.smtpAuth) private readonly smtpAuth: boolean,
    @inject(CONFIG.smtpHost) private readonly smtpHost: string,
    @inject(CONFIG.smtpPort) private readonly smtpPort: string,
    @inject(CONFIG.smtpAuthUser) private readonly smtpAuthUser: string,
    @inject(CONFIG.smtpAuthPassword) private readonly smtpAuthPassword: string,
    @inject(CONFIG.smtpStartTls) private readonly smtpStartTls: boolean,
    @inject(CONFIG.smtpFrom) private readonly smtpFrom: string,
    @inject(CONFIG.smtpSSL) private readonly smtpSSL: boolean
  ) {}

  public async createRealm(realmName: string) {
    const kcAdm = await this.kcAdminClient()
    const pPolicy = 'passwordPolicy' // to workaround sonar warnings
    await kcAdm.realms.create({
      realm: realmName,
      enabled: true,
      registrationAllowed: false,
      resetPasswordAllowed: false,
      verifyEmail: true,
      loginTheme: 'komgo',
      emailTheme: 'komgo',
      [pPolicy]: 'length(12) and specialChars(1) and upperCase(1) and lowerCase(1) and digits(1)',
      loginWithEmailAllowed: true,
      smtpServer: {
        host: this.smtpHost,
        port: this.smtpPort,
        auth: this.smtpAuth,
        user: this.smtpAuthUser,
        password: this.smtpAuthPassword,
        from: this.smtpFrom,
        starttls: this.smtpStartTls,
        ssl: this.smtpSSL
      },
      ...(this.keycloakSsl ? { sslRequired: 'all' } : {})
    })
  }

  public async realmExists(realmName: string): Promise<boolean> {
    const kcAdm = await this.kcAdminClient()
    const realm = await kcAdm.realms.findOne({ realm: realmName })
    return realm !== null
  }

  /**
   * Adds necessary KC-specific roles. Users created with userAdmin role should have
   * realm-management role from client otherwise they won't be able to access User Management page
   */
  public async updateUserAdminRole(realmName: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    const clients = await kcAdm.clients.find()
    const clientWithUserManagement = clients.find(item => item.clientId === 'realm-management')
    const roleToUpdate = await kcAdm.clients.findRole({
      id: clientWithUserManagement.id,
      roleName: 'manage-users'
    })
    const userAdminRole = await kcAdm.roles.findOneByName({
      name: 'userAdmin'
    })
    await kcAdm.roles.createCompositeById({ id: userAdminRole.id }, [roleToUpdate])
  }

  public async updateLoggingConfig(realmName: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    await kcAdm.realms.updateEventsConfig(
      { realm: realmName },
      {
        eventsEnabled: true,
        adminEventsEnabled: true,
        adminEventsDetailsEnabled: true,
        eventsExpiration: 31536000
      }
    )
  }

  public async createRoles(realmName: string, roles: string[]) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    for (const role of roles) {
      await kcAdm.roles.create({ name: role })
    }
  }

  public async createClient(realmName: string, clientId: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    await kcAdm.clients.create({
      clientId,
      redirectUris: [this.keycloakCorsAllowedOrigin],
      webOrigins: [this.keycloakCorsAllowedOrigin],
      directAccessGrantsEnabled: true,
      publicClient: true
    })
  }

  public async createUsers(realmName: string, users: ICreateKeycloakUser[], temporaryPasswords: boolean) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    for (const user of users) {
      const result = await kcAdm.users.create({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: true,
        enabled: true,
        realm: realmName
      })
      await kcAdm.users.resetPassword({
        realm: realmName,
        id: result.id,
        credential: {
          temporary: temporaryPasswords,
          type: 'password',
          value: user.defaultPassword
        }
      })

      const roles = await kcAdm.roles.find()

      await kcAdm.users.addRealmRoleMappings({
        id: result.id,
        roles: user.roleIDs.map(item => {
          const resultingRole = roles.find(object => object.name === item)
          return { name: resultingRole.name, id: resultingRole.id }
        })
      })
    }
  }

  public async updateClientWithTenantId(realmName: string, clientId: string, tenantId: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    const result = await kcAdm.clientScopes.create({
      name: 'tenant',
      description: 'identity for multitenant realms',
      protocol: 'openid-connect'
    })
    await kcAdm.clientScopes.addProtocolMapper(
      { id: result.id },
      {
        config: {
          'claim.name': 'tenantStaticId',
          'claim.value': tenantId,
          'json.Type': 'string',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'userinfo.token.claim': 'true'
        },
        name: 'staticId',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-hardcoded-claim-mapper'
      }
    )
    const clientRepr = await kcAdm.clients.find({ clientId })
    await kcAdm.clients.addDefaultClientScope({
      id: clientRepr[0].id,
      clientScopeId: result.id
    })
  }

  public async userHasRole(realmName: string, userId: string, roleName: string): Promise<boolean> {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })

    const userRoleMappings = await kcAdm.users.listRoleMappings({
      id: userId
    })

    if (!userRoleMappings.realmMappings) {
      return false
    }

    return userRoleMappings.realmMappings.find(item => item.name === roleName) !== undefined
  }

  public async assignRole(realmName: string, userId: string, role) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })

    await kcAdm.users.addRealmRoleMappings({
      id: userId,
      roles: [role]
    })
  }

  public async unassignRole(realmName: string, userId: string, role) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })

    await kcAdm.users.delRealmRoleMappings({
      id: userId,
      roles: [role]
    })
  }

  public async getRoleByName(realmName: string, roleName: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })

    return kcAdm.roles.findOneByName({
      name: roleName
    })
  }

  public async createRole(realmName: string, roleName: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })

    return kcAdm.roles.create({ name: roleName })
  }

  public async removeRole(realmName: string, roleName: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })

    return kcAdm.roles.delByName({ name: roleName })
  }

  public async addViewUsersPermission(realmName: string, roleId: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    const clients = await kcAdm.clients.find()
    const clientWithUserManagement = clients.find(item => item.clientId === 'realm-management')
    const roleToUpdate = await kcAdm.clients.findRole({
      id: clientWithUserManagement.id,
      roleName: 'view-users'
    })

    await kcAdm.roles.createCompositeById({ id: roleId }, [roleToUpdate])
  }

  public async removeViewUsersPermission(realmName: string, roleId: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    const clients = await kcAdm.clients.find()
    const clientWithUserManagement = clients.find(item => item.clientId === 'realm-management')
    const roleToUpdate = await kcAdm.clients.findRole({
      id: clientWithUserManagement.id,
      roleName: 'view-users'
    })

    await kcAdm.roles.delCompositeById({ id: roleId }, [roleToUpdate])
  }

  public async addCrudUsersPermission(realmName: string, roleId: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    const clients = await kcAdm.clients.find()
    const clientWithUserManagement = clients.find(item => item.clientId === 'realm-management')
    const roleToUpdate = await kcAdm.clients.findRole({
      id: clientWithUserManagement.id,
      roleName: 'manage-users'
    })

    await kcAdm.roles.createCompositeById({ id: roleId }, [roleToUpdate])
  }

  public async removeCrudUsersPermission(realmName: string, roleId: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    const clients = await kcAdm.clients.find()
    const clientWithUserManagement = clients.find(item => item.clientId === 'realm-management')
    const roleToUpdate = await kcAdm.clients.findRole({
      id: clientWithUserManagement.id,
      roleName: 'manage-users'
    })

    await kcAdm.roles.delCompositeById({ id: roleId }, [roleToUpdate])
  }

  public async findUsersByRole(realmName: string, roleName: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })

    return kcAdm.roles.findUsersByRole({ name: roleName })
  }

  public async createUser(realmName: string, user) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    return kcAdm.users.create({ ...user, enabled: true })
  }

  public async findUser(realmName: string, userId: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    return kcAdm.users.findOne({ id: userId })
  }

  public async findUsers(realmName: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })
    return kcAdm.users.find()
  }

  public async resetUserPassword(realmName: string, userId: string, password: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })

    return kcAdm.users.resetPassword({
      realm: realmName,
      id: userId,
      credential: {
        temporary: false,
        type: 'password',
        value: password
      }
    })
  }

  public async listRoleMappings(realmName: string, userId: string) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })

    return kcAdm.users.listRoleMappings({ id: userId })
  }

  public async executeActionsEmail(realmName: string, userId: string, actions) {
    const kcAdm = await this.kcAdminClient()
    kcAdm.setConfig({
      realmName
    })

    return kcAdm.users.executeActionsEmail({ id: userId, actions })
  }
}
