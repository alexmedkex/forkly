import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'

const { notFoundException } = ErrorUtils

export const rolesMock = [
  {
    id: 'someRole',
    label: 'Role 1',
    description: 'Some description',
    permittedActions: [
      {
        permission: {
          id: 'permitionId1',
          label: 'Permition1'
        },
        action: {
          id: 'actionId1',
          label: 'action 1'
        },
        product: {
          id: 'product1',
          label: 'action 1'
        }
      },
      {
        permission: {
          id: 'permission',
          label: 'Permition2'
        },
        action: {
          id: 'action',
          label: 'action 2'
        },
        product: {
          id: 'product',
          label: 'action 2'
        }
      }
    ]
  },
  {
    id: 'role2Id',
    label: 'Role2 1',
    description: 'Some description 2',
    permittedActions: [
      {
        permission: {
          id: 'permitionId3',
          label: 'Permition3'
        },
        action: {
          id: 'actionId3',
          label: 'action 3'
        },
        product: {
          id: 'product3',
          label: 'action 3'
        }
      },
      {
        permission: {
          id: 'permitionId4',
          label: 'Permition4'
        },
        action: {
          id: 'actionId4',
          label: 'action 4'
        },
        product: {
          id: 'product4',
          label: 'action 4'
        }
      }
    ],
    isSystemRole: true
  }
]

export const mockRequests = [
  {
    label: 'Role 1',
    description: 'Some description 3',
    permittedActions: [
      {
        permission: 'permitionId1',
        action: 'actionId1',
        product: 'product1'
      },
      {
        permission: 'permitionId2',
        action: 'actionId2',
        product: 'product2'
      }
    ]
  },
  {
    label: 'Role2 1',
    description: 'Some description 4',
    permittedActions: [
      {
        permission: 'permitionId3',
        action: 'actionId3',
        product: 'product3'
      },
      {
        permission: 'permitionId4',
        action: 'actionId4',
        product: 'product4'
      }
    ],
    isSystemRole: true
  }
]

export class RoleDataAgent {
  emptyResponse: boolean

  constructor(empty?: boolean) {
    this.emptyResponse = empty || false
  }

  async createRole() {
    return rolesMock[0]
  }

  async getRole(id) {
    const roles = rolesMock.filter(role => id === role.id)
    if (roles.length > 0) {
      return roles[0]
    } else {
      throw notFoundException(ErrorCode.Configuration, 'Role not found')
    }
  }

  async getPermissionsByRoles() {
    return rolesMock[0].permittedActions
  }

  async getRoles() {
    return this.emptyResponse ? [] : rolesMock
  }

  async getRolesById(ids) {
    return this.emptyResponse ? [] : rolesMock
  }

  async updateRole() {
    return rolesMock[0]
  }

  async removeRole() {
    return rolesMock[0]
  }
}
