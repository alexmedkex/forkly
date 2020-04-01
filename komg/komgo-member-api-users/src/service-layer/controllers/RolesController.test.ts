import 'jest'
import 'reflect-metadata'
import * as jestMock from 'jest-mock'
import { IRoleResponse } from '@komgo/types'
import KeycloakAdminService from '../../buisness-layer/keycloak/KeycloakAdminService'
import RolesClient from '../../infrastructure/roles/RolesClient'

const role = {
  id: '53fbf4615c3b9f41c381b6a3',
  label: 'username'
}
const mockRolesInst: IRoleResponse = {
  id: 'userAdmin',
  label: 'User Admin',
  description: 'User Admin',
  permittedActions: [
    {
      product: {
        id: 'administration',
        label: 'Administration'
      },
      action: {
        id: 'manageUsers',
        label: 'Manage Users'
      },
      permission: {
        id: 'crud',
        label: 'Create/Update/Delete'
      }
    }
  ]
}

const permAction = {
  product: {
    id: 'administration',
    label: 'Administration'
  },
  action: {
    id: 'manageUsers',
    label: 'Manage Users'
  },
  permission: {
    id: 'read',
    label: 'View'
  }
}

function mock(classType) {
  const t = jestMock.getMetadata(classType)
  const mockType = jestMock.generateFromMetadata(t)
  return new mockType()
}

const mockRolesClient = mock(RolesClient)
const mockKeycloakAdminService = mock(KeycloakAdminService)

const mockUsers = [
  {
    id: '34fwed235v5b5',
    username: 'jbourne',
    firstName: 'Jason',
    lastName: 'Bourne',
    email: 'jbourne@corp.com',
    createdAt: 2347978234553
  },
  {
    id: 'g63576b455bv2',
    username: 'jadams',
    firstName: 'Julia',
    lastName: 'Adams',
    email: 'jadams@corp.com',
    createdAt: 2347978234553
  }
]

import { RolesController } from './RolesController'

describe('RegisterNewRole()', () => {
  let controller: RolesController
  beforeEach(() => {
    jest.clearAllMocks()
    controller = new RolesController('realmName', mockRolesClient, mockKeycloakAdminService)
  })

  it('should trigger create', async () => {
    mockKeycloakAdminService.createRole.mockResolvedValue({ id: 'userAdmin' })
    mockKeycloakAdminService.getRoleByName.mockResolvedValue({ id: 'userAdmin' })
    mockRolesClient.createRole.mockResolvedValue(mockRolesInst)
    await controller.RegisterNewRole(role)
    expect(mockRolesClient.createRole).toHaveBeenCalledWith(role)
  })

  it('should trigger addViewUsersPermission', async () => {
    const modifiedRoleInst = {
      ...mockRolesInst,
      permittedActions: [permAction]
    }
    mockKeycloakAdminService.createRole.mockResolvedValue({ id: 'userAdmin' })
    mockKeycloakAdminService.getRoleByName.mockResolvedValue({ id: 'userAdmin' })
    mockRolesClient.createRole.mockResolvedValue(modifiedRoleInst)
    await controller.RegisterNewRole(role)
    expect(mockKeycloakAdminService.addViewUsersPermission).toHaveBeenCalledWith('realmName', 'userAdmin')
  })

  it('should return role', async () => {
    mockKeycloakAdminService.createRole.mockResolvedValue({ id: 'userAdmin' })
    mockKeycloakAdminService.getRoleByName.mockResolvedValue({ id: 'userAdmin' })
    mockRolesClient.createRole.mockResolvedValue(mockRolesInst)
    const result: IRoleResponse = await controller.RegisterNewRole(role)
    expect(result).toEqual(mockRolesInst)
  })

  it('should throw an error', async () => {
    mockRolesClient.createRole.mockImplementation(() => {
      throw 'error'
    })

    await controller.RegisterNewRole(role).catch(err => {
      expect(err).toBeDefined()
    })
  })
})

describe('UpdateRole()', () => {
  let controller: RolesController
  beforeEach(() => {
    jest.clearAllMocks()
    controller = new RolesController('realmName', mockRolesClient, mockKeycloakAdminService)
  })

  it('should trigger update', async () => {
    mockRolesClient.getRole.mockResolvedValue(mockRolesInst)
    mockRolesClient.updateRole.mockResolvedValue(mockRolesInst)
    const roleResp = await controller.UpdateRole(role.id, role)
    expect(roleResp).toEqual(mockRolesInst)
  })

  it('should trigger removeCrudUsersPermission', async () => {
    const modifiedRoleInst = { ...mockRolesInst, permittedActions: [] }
    mockRolesClient.getRole.mockResolvedValue(mockRolesInst)
    mockRolesClient.updateRole.mockResolvedValue(modifiedRoleInst)
    mockKeycloakAdminService.getRoleByName.mockResolvedValue({ id: 'userAdmin' })
    const roleResp = await controller.UpdateRole(role.id, role)
    expect(mockKeycloakAdminService.removeCrudUsersPermission).toHaveBeenCalled()
  })

  it('should trigger addCrudUserPermission', async () => {
    const modifiedRoleInst = { ...mockRolesInst, permittedActions: [] }
    mockRolesClient.getRole.mockResolvedValue(modifiedRoleInst)
    mockRolesClient.updateRole.mockResolvedValue(mockRolesInst)
    mockKeycloakAdminService.getRoleByName.mockResolvedValue({ id: 'userAdmin' })
    const roleResp = await controller.UpdateRole(role.id, role)
    expect(mockKeycloakAdminService.addCrudUsersPermission).toHaveBeenCalled()
  })

  it('should trigger addViewUserPermission', async () => {
    const modifiedRoleInst = {
      ...mockRolesInst,
      permittedActions: [permAction]
    }
    mockRolesClient.getRole.mockResolvedValue(mockRolesInst)
    mockRolesClient.updateRole.mockResolvedValue(modifiedRoleInst)
    mockKeycloakAdminService.getRoleByName.mockResolvedValue({ id: 'userAdmin' })
    const roleResp = await controller.UpdateRole(role.id, role)
    expect(mockKeycloakAdminService.addViewUsersPermission).toHaveBeenCalled()
  })

  it('should trigger removeViewUserPermission', async () => {
    const modifiedRoleInst = {
      ...mockRolesInst,
      permittedActions: [permAction]
    }
    mockRolesClient.getRole.mockResolvedValue(modifiedRoleInst)
    mockRolesClient.updateRole.mockResolvedValue(mockRolesInst)
    mockKeycloakAdminService.getRoleByName.mockResolvedValue({ id: 'userAdmin' })
    const roleResp = await controller.UpdateRole(role.id, role)
    expect(mockKeycloakAdminService.removeViewUsersPermission).toHaveBeenCalled()
  })
})

describe('GetUsersByRole()', () => {
  let controller: RolesController
  beforeEach(() => {
    jest.clearAllMocks()
    controller = new RolesController('realmName', mockRolesClient, mockKeycloakAdminService)
  })

  it('should return Users ', async () => {
    mockKeycloakAdminService.findUsersByRole.mockResolvedValue(mockUsers)
    const result = await controller.GetUsersByRole('admin')

    expect(result).toEqual(mockUsers)
  })
})

describe('AssignRoleToUsers()', () => {
  let controller: RolesController
  beforeEach(() => {
    jest.clearAllMocks()
    controller = new RolesController('realmName', mockRolesClient, mockKeycloakAdminService)
  })

  it('should call getRoleByName', async () => {
    await controller.AssignRoleToUsers(role.id, { added: [], removed: [] })
    expect(mockKeycloakAdminService.getRoleByName).toHaveBeenCalled()
  })

  it('should call createRole', async () => {
    mockKeycloakAdminService.getRoleByName.mockResolvedValue(null)
    await controller.AssignRoleToUsers(role.id, { added: [], removed: [] })
    expect(mockKeycloakAdminService.createRole).toHaveBeenCalled()
  })

  it('should call userHasRole', async () => {
    await controller.AssignRoleToUsers(role.id, { added: ['user'], removed: ['user'] })
    expect(mockKeycloakAdminService.userHasRole).toHaveBeenCalled()
  })

  it('should call assignRole', async () => {
    mockKeycloakAdminService.userHasRole.mockImplementation(() => false)
    await controller.AssignRoleToUsers(role.id, { added: ['user'], removed: ['user'] })
    expect(mockKeycloakAdminService.assignRole).toHaveBeenCalled()
  })

  it('should call removeRole', async () => {
    mockKeycloakAdminService.userHasRole.mockImplementation(() => true)
    await controller.AssignRoleToUsers(role.id, { added: ['user'], removed: ['user'] })
    expect(mockKeycloakAdminService.unassignRole).toHaveBeenCalled()
  })

  it('should return network error', async () => {
    mockRolesClient.getRole.mockImplementation(() => {
      throw 'error'
    })
    const requestPromise = controller.AssignRoleToUsers(role.id, { added: ['user'], removed: ['user'] })
    await requestPromise.catch(err => {
      expect(err).toBeDefined()
    })
    expect.hasAssertions()
  })

  it('should return not found error', async () => {
    mockRolesClient.getRole.mockImplementation(() => {
      throw { response: { status: 404 } }
    })
    const requestPromise = controller.AssignRoleToUsers(role.id, { added: ['user'], removed: ['user'] })
    await requestPromise.catch(err => {
      expect(err).toBeDefined()
    })
    expect.hasAssertions()
  })

  it('should return error', async () => {
    mockRolesClient.getRole.mockReset()
    mockKeycloakAdminService.getRoleByName.mockImplementationOnce(() => {
      throw 'error'
    })
    mockKeycloakAdminService.createRole.mockImplementation(() => {
      throw 'error'
    })

    await controller.AssignRoleToUsers(role.id, { added: [], removed: [] }).catch(err => {
      expect(err).toEqual('error')
    })
    expect.hasAssertions()
  })
})

describe('DeleteRole()', () => {
  let controller: RolesController
  beforeEach(() => {
    jest.clearAllMocks()
    controller = new RolesController('realmName', mockRolesClient, mockKeycloakAdminService)
  })

  it('should call removeRole', async () => {
    await controller.DeleteRole('userAdmin')
    expect(mockRolesClient.deleteRole).toHaveBeenCalled()
    expect(mockKeycloakAdminService.removeRole).toHaveBeenCalled()
  })
})
