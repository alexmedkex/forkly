import { ErrorCode as ErrCode } from '@komgo/error-utilities'
import { ErrorUtils as ErrUtils, HttpException } from '@komgo/microservice-config'
import {
  IAssignRoleRequest,
  IRoleRequest,
  IRoleResponse,
  IRoleUserResponse,
  IRoleDeletedResponse,
  IUserResponse
} from '@komgo/types'
import { Route, Delete, Get, Post, Path, Patch, Put, Body, Controller, Security, Tags, Response } from 'tsoa'

import { IKeycloakAdminService } from '../../buisness-layer/keycloak/KeycloakAdminService'
import RolesClient from '../../infrastructure/roles/RolesClient'
import { CONFIG } from '../../inversify/config'
import { inject, provide } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'

const viewUsersPermission = 'administration.manageUsers.read'
const crudUsersPermission = 'administration.manageUsers.crud'

const ROLE_NOT_FOUND = 'Role not found'

@Tags('Roles')
@Route('roles')
@provide(RolesController)
export class RolesController extends Controller {
  constructor(
    @inject(CONFIG.realm) private readonly realmName: string,
    @inject(TYPES.RolesClient) private readonly rolesClient: RolesClient,
    @inject(TYPES.KeycloakAdminService) private readonly keycloakAdminService: IKeycloakAdminService
  ) {
    super()
  }

  /**
   * @summary Register new role
   */
  @Security('withPermission', ['administration', 'manageRoles', 'crud'])
  @Response('400', 'missing field')
  @Response('422', 'role validation failed')
  @Post()
  public async RegisterNewRole(@Body() request: IRoleRequest): Promise<IRoleResponse> {
    const resp = await this.rolesClient.createRole(request)

    const newRolePermissions = resp.permittedActions.map(
      perm => `${perm.product.id}.${perm.action.id}.${perm.permission && perm.permission.id}`
    )
    let role = await this.keycloakAdminService.createRole(this.realmName, resp.id)
    role = await this.keycloakAdminService.getRoleByName(this.realmName, resp.id)

    if (newRolePermissions.indexOf(viewUsersPermission) > -1) {
      await this.keycloakAdminService.addViewUsersPermission(this.realmName, role.id)
    }
    if (newRolePermissions.indexOf(crudUsersPermission) > -1) {
      await this.keycloakAdminService.addCrudUsersPermission(this.realmName, role.id)
    }

    return resp
  }

  /**
   * @summary Update role
   */
  @Security('withPermission', ['administration', 'manageRoles', 'crud'])
  @Response('400', 'missing field')
  @Response('422', 'role validation failed')
  @Put('{roleId}')
  public async UpdateRole(@Path() roleId: string, @Body() request: IRoleRequest): Promise<IRoleResponse> {
    const oldRole = await this.rolesClient.getRole(roleId)
    const resp = await this.rolesClient.updateRole(roleId, request)

    const oldRolePermissions = oldRole.permittedActions.map(
      perm => `${perm.product.id}.${perm.action.id}.${perm.permission && perm.permission.id}`
    )
    const newRolePermissions = resp.permittedActions.map(
      perm => `${perm.product.id}.${perm.action.id}.${perm.permission && perm.permission.id}`
    )

    if (
      newRolePermissions.indexOf(viewUsersPermission) === -1 &&
      oldRolePermissions.indexOf(viewUsersPermission) > -1
    ) {
      const role = await this.keycloakAdminService.getRoleByName(this.realmName, resp.id)
      await this.keycloakAdminService.removeViewUsersPermission(this.realmName, role.id)
    }

    if (
      newRolePermissions.indexOf(crudUsersPermission) === -1 &&
      oldRolePermissions.indexOf(crudUsersPermission) > -1
    ) {
      const role = await this.keycloakAdminService.getRoleByName(this.realmName, resp.id)
      await this.keycloakAdminService.removeCrudUsersPermission(this.realmName, role.id)
    }

    if (
      newRolePermissions.indexOf(crudUsersPermission) > -1 &&
      oldRolePermissions.indexOf(crudUsersPermission) === -1
    ) {
      const role = await this.keycloakAdminService.getRoleByName(this.realmName, resp.id)
      await this.keycloakAdminService.addCrudUsersPermission(this.realmName, role.id)
    }

    if (
      newRolePermissions.indexOf(viewUsersPermission) > -1 &&
      oldRolePermissions.indexOf(viewUsersPermission) === -1
    ) {
      const role = await this.keycloakAdminService.getRoleByName(this.realmName, resp.id)
      await this.keycloakAdminService.addViewUsersPermission(this.realmName, role.id)
    }

    return resp
  }

  /**
   * @summary returns users by Role
   */
  @Security('withPermission', ['administration', 'manageRoles', 'read'])
  @Response('404', ROLE_NOT_FOUND)
  @Get('{roleId}/users')
  public async GetUsersByRole(@Path() roleId: string): Promise<IUserResponse[]> {
    let usersKc
    try {
      usersKc = await this.keycloakAdminService.findUsersByRole(this.realmName, roleId)
    } catch (e) {
      throw ErrUtils.notFoundException(ErrCode.Authorization, `Role not found`)
    }

    return usersKc.map(({ id, username, firstName, lastName, createdAt: createdTimestamp, email }) => ({
      id,
      username,
      firstName,
      lastName,
      createdAt: createdTimestamp,
      email
    }))
  }

  /**
   * @summary assign/unassign role to users
   */
  @Security('withPermission', ['administration', 'manageRoles', 'crud'])
  @Response('404', ROLE_NOT_FOUND)
  @Patch('{roleId}/assigned-users')
  public async AssignRoleToUsers(@Path() roleId: string, @Body() request: IAssignRoleRequest): Promise<any> {
    const { added, removed } = request
    let role
    try {
      role = await this.rolesClient.getRole(roleId)
    } catch (error) {
      const httpNotFound = 404
      if (error.response && error.response.status === httpNotFound) {
        throw ErrUtils.notFoundException(ErrCode.Authorization, `Role with ID ${roleId} doesn\'t exist`)
      }
      throw error
    }

    role = await this.keycloakAdminService.getRoleByName(this.realmName, roleId)
    if (role === null) {
      role = await this.keycloakAdminService.createRole(this.realmName, roleId)
    }
    role = await this.keycloakAdminService.getRoleByName(this.realmName, roleId)
    if (added && added.length) {
      await Promise.all(
        added.map(async (userId: string) => {
          const isRole = await this.keycloakAdminService.userHasRole(this.realmName, userId, roleId)
          if (!isRole) return this.keycloakAdminService.assignRole(this.realmName, userId, role)
          return true
        })
      )
    }

    if (removed && removed.length) {
      await Promise.all(
        removed.map(async (userId: string) => {
          const isRole = await this.keycloakAdminService.userHasRole(this.realmName, userId, roleId)
          if (isRole) return this.keycloakAdminService.unassignRole(this.realmName, userId, role)
        })
      )
    }
  }

  /**
   * Delete role from api-roles and api-users
   *
   * @summary delete role
   */
  @Security('withPermission', ['administration', 'manageRoles', 'crud'])
  @Response('404', ROLE_NOT_FOUND)
  @Delete('{roleId}')
  public async DeleteRole(@Path() roleId: string): Promise<IRoleDeletedResponse> {
    await this.rolesClient.deleteRole(roleId)
    try {
      await this.keycloakAdminService.removeRole(this.realmName, roleId)
    } catch (e) {
      // ignore error because role may not exist in Keycloak
    }

    return { roleId }
  }
}
