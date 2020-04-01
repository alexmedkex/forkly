import { IModelFactory } from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { IRolePermittedActionResponse, IRolePermittedActionRequest } from '@komgo/types'
import * as camelcase from 'camelcase'
import { injectable, inject } from 'inversify'

import { IRoleDocument, RoleModel } from '../models/role'

import { IRoleDataAgent } from './interfaces/IRoleDataAgent'

const { notFoundException, unprocessableEntityException } = ErrorUtils

const generateIdFromLabel = (label: string) => {
  const stripped = label.replace(/[^A-Za-z0-9 ]+/gm, '')
  if (stripped.trim() === '') {
    throw unprocessableEntityException(ErrorCode.ValidationHttpContent, 'Label must contain alphanumeric characters')
  }
  return camelcase(stripped)
}

@injectable()
export default class RoleDataAgent implements IRoleDataAgent {
  private readonly roleModel: RoleModel

  constructor(@inject('Factory<RoleModel>') getRoleModel: IModelFactory<IRoleDocument>) {
    this.roleModel = getRoleModel()
  }

  async createRole(data: IRoleDocument): Promise<IRoleDocument> {
    if (data.id) {
      throw unprocessableEntityException(ErrorCode.ValidationHttpContent, 'Unexpected property "id"')
    }
    data.id = generateIdFromLabel(data.label)
    if (await this.roleModel.findOne({ id: data.id }).exec()) {
      throw unprocessableEntityException(ErrorCode.ValidationHttpContent, `Role with ID "${data.id}" already exists`)
    }
    return this.roleModel.create(data)
  }

  async getRole(id: string): Promise<IRoleDocument> {
    const result = await this.roleModel.findOne({ id }).exec()
    if (!result) {
      throw notFoundException(ErrorCode.ValidationHttpContent, 'Role not found')
    }
    return result
  }

  async getRoles(permittedAction?: IRolePermittedActionRequest): Promise<IRoleDocument[]> {
    let filter = {}
    if (permittedAction && permittedAction.action) {
      filter = {
        'permittedActions.action.id': permittedAction.action
      }
    }
    if (permittedAction && permittedAction.product) {
      filter = {
        ...filter,
        'permittedActions.product.id': permittedAction.product
      }
    }
    return this.roleModel.find(filter).exec()
  }

  /**
   * get permittedActions by roles grouped by product, action, permission
   */
  async getPermissionsByRoles(roles: string[]): Promise<IRolePermittedActionResponse[]> {
    const permissions = await this.roleModel
      .aggregate([
        { $match: { id: { $in: roles } } },
        { $unwind: '$permittedActions' },
        {
          $group: {
            _id: {
              product: '$permittedActions.product.id',
              action: '$permittedActions.action.id',
              permission: { $ifNull: ['$permittedActions.permission.id', null] }
            },
            product: { $first: '$permittedActions.product' },
            action: { $first: '$permittedActions.action' },
            permission: { $first: '$permittedActions.permission' }
          }
        }
      ])
      .exec()
    return permissions.map(permission => {
      delete permission._id
      return permission
    })
  }

  async getRolesById(ids: string[]): Promise<IRoleDocument[]> {
    const filter = { id: { $in: ids } }
    return this.roleModel.find(filter).exec()
  }

  async updateRole(id: string, data: IRoleDocument): Promise<IRoleDocument> {
    const result = await this.roleModel.findOne({ id }).exec()
    if (!result) {
      throw notFoundException(ErrorCode.ValidationHttpContent, 'Role not found')
    }
    result.set(data)
    return result.save()
  }

  async removeRole(id: string): Promise<void> {
    const result = await this.roleModel.findOne({ id }).exec()
    if (!result) {
      throw notFoundException(ErrorCode.ValidationHttpContent, 'Role not found')
    }
    await result.remove()
  }
}
