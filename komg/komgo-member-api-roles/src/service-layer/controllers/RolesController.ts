import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { IRoleResponse, IRoleRequest, IRolePermittedActionRequest } from '@komgo/types'
import { Body, Controller, Delete, Get, Post, Put, Query, Route, Response, Security, Tags } from 'tsoa'

import { IRoleDataAgent } from '../../data-layer/data-agents/interfaces/IRoleDataAgent'
import { IRoleDocument } from '../../data-layer/models/role'
import { inject, provide } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { IRoleRequestWithoutLabel } from '../request/role'

const { conflictException, unprocessableEntityException } = ErrorUtils
const requiredFieldIsMissing = 'required field is missing'
const invalidParameter = 'invalid parameter'
const roleNotFound = 'Role not found'

/**
 * Roles Routes Class
 * @export
 * @class RolesController
 * @extends {Controller}
 */
@Tags('Roles')
@Route('roles')
@provide(RolesController)
export class RolesController extends Controller {
  constructor(@inject(TYPES.RoleDataAgent) private readonly roleDataAgent: IRoleDataAgent) {
    super()
  }

  /**
   * @summary returns roles
   * @param {string} productId filer by permittedActions.product.id
   * @param {string} actionId filer by permittedActions.action.id. Allowed only if productId id passed
   */
  @Security('signedIn')
  @Response('422', 'actionId can be used only along with productId parameter')
  @Get()
  public async GetRoles(
    @Query('productId') productId?: string,
    @Query('actionId') actionId?: string
  ): Promise<IRoleResponse[]> {
    if (actionId && !productId) {
      throw unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'actionId can be used only along with productId parameter'
      )
    }
    if (!productId && !actionId) {
      return this.roleDataAgent.getRoles()
    } else {
      return this.roleDataAgent.getRoles({ product: productId, action: actionId })
    }
  }

  /**
   * @summary creates a new role
   */
  @Security('withPermission', ['administration', 'manageRoles', 'crud'])
  @Response('422', 'Role with ID already exists')
  @Response('400', requiredFieldIsMissing)
  @Response('422', invalidParameter)
  @Post()
  public async CreateRoles(@Body() body: IRoleRequest): Promise<IRoleResponse> {
    const role = {
      label: body.label,
      description: body.description,
      permittedActions: body.permittedActions.map((item: IRolePermittedActionRequest) => ({
        product: {
          id: item.product,
          label: item.product
        },
        action: {
          id: item.action,
          label: item.action
        },
        permission: item.permission
          ? {
              id: item.permission,
              label: item.permission
            }
          : null
      }))
    }
    return this.roleDataAgent.createRole(role as IRoleDocument)
  }

  /**
   * @summary returns role by id
   */
  @Security('withPermission', ['administration', 'manageRoles', 'read'])
  @Response('404', roleNotFound)
  @Get('{roleId}')
  public async GetRole(roleId: string): Promise<IRoleResponse> {
    return this.roleDataAgent.getRole(roleId)
  }

  /**
   * @summary updates role by id
   */
  @Security('withPermission', ['administration', 'manageRoles', 'crud'])
  @Response('404', roleNotFound)
  @Response('400', requiredFieldIsMissing)
  @Response('422', invalidParameter)
  @Put('{roleId}')
  public async PutRole(roleId: string, @Body() body: IRoleRequestWithoutLabel): Promise<IRoleResponse> {
    await this.checkSystemRole(roleId)
    const role = {
      description: body.description,
      permittedActions: body.permittedActions.map((item: IRolePermittedActionRequest) => ({
        product: {
          id: item.product,
          label: item.product
        },
        action: {
          id: item.action,
          label: item.action
        },
        permission: item.permission
          ? {
              id: item.permission,
              label: item.permission
            }
          : null
      }))
    }
    return this.roleDataAgent.updateRole(roleId, role as IRoleDocument)
  }

  /**
   * @summary deletes role by id
   */
  @Security('withPermission', ['administration', 'manageRoles', 'crud'])
  @Response('404', roleNotFound)
  @Delete('{roleId}')
  public async DeleteRole(roleId: string): Promise<void> {
    await this.checkSystemRole(roleId)
    return this.roleDataAgent.removeRole(roleId)
  }

  private async checkSystemRole(roleId: string) {
    const oldRole: IRoleDocument = await this.roleDataAgent.getRole(roleId)
    if (oldRole && oldRole.isSystemRole) {
      throw conflictException(ErrorCode.ValidationHttpContent, 'System role can not be changed or deleted')
    }
  }
}
