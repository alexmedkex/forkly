import DataAccess from '@komgo/data-access'
import mockingoose from 'mockingoose'
import 'reflect-metadata'

import { RoleSchema } from '../models/role/RoleSchema'

import RoleDataAgent from './RoleDataAgent'

const dummyRecord = {
  label: 'some role',
  description: 'someRoleDescription',
  permittedActions: [
    {
      product: {
        id: 'administration',
        label: 'administration'
      },
      action: {
        id: 'manageUsers',
        label: 'manageUsers'
      },
      permission: {
        id: 'read',
        label: 'read'
      }
    }
  ]
}

const errorNotFound = {
  status: 404
}

const errorInvalidAttribute = {
  status: 422
}

describe('RoleDataAgent', () => {
  let roleDataAgent
  let getRoleModel
  let roleModel

  beforeEach(() => {
    mockingoose.resetAll()
    roleModel = DataAccess.connection.model('role', RoleSchema)
    getRoleModel = jest.fn(() => roleModel)
    roleDataAgent = new RoleDataAgent(getRoleModel)
  })

  it('Creates Role with unique camel case label', async () => {
    const label = 'some new label'
    const expectedId = 'someNewLabel'
    const result = await roleDataAgent.createRole({ ...dummyRecord, label, id: undefined } as any)
    expect(result.id).toEqual(expectedId)
  })

  it('Ignores non-alphanumeric characters', async () => {
    const label = '[Custom] test ~!@#$%^&*()_+{}:"<>?'
    const result = await roleDataAgent.createRole({ ...dummyRecord, label, id: undefined } as any)
    expect(result.id).toEqual('customTest')
  })

  it('Fails to create a new Role with an invalid special symbol-only label', async () => {
    const label = '()[]+-'
    const check = roleDataAgent.createRole({ ...dummyRecord, label, id: undefined } as any)
    await expect(check).rejects.toMatchObject(errorInvalidAttribute)
  })

  it('Fails to create a new Role with non-unique label', async () => {
    mockingoose(roleModel).toReturn(dummyRecord, 'findOne')
    const check = roleDataAgent.createRole({ ...dummyRecord, id: undefined } as any)
    await expect(check).rejects.toMatchObject(errorInvalidAttribute)
  })

  it('Fails to create a new Role if ID is passed to record', async () => {
    const label = 'some new label'
    const check = roleDataAgent.createRole({ ...dummyRecord, label, id: 'some-id' } as any)
    await expect(check).rejects.toMatchObject(errorInvalidAttribute)
  })

  it('Returns existing Role', async () => {
    mockingoose(roleModel).toReturn(dummyRecord, 'findOne')
    const result = await roleDataAgent.getRole(dummyRecord.id)
    expect(result.toJSON()).toMatchObject(dummyRecord)
  })

  it('Fails to return non-existing Role', async () => {
    mockingoose(roleModel).toReturn(undefined, 'findOne')
    const check = roleDataAgent.getRole('someIdThatDoesntExistInMock')
    await expect(check).rejects.toMatchObject(errorNotFound)
  })

  it('Returns list of roles', async () => {
    mockingoose(roleModel).toReturn([dummyRecord], 'find')
    const result = await roleDataAgent.getRoles()
    expect(result[0].toJSON()).toMatchObject(dummyRecord)
  })

  it('Returns list of roles for specific ids', async () => {
    expect.assertions(1)
    const finderMock = query => {
      expect(query.getQuery()).toMatchObject({
        id: {
          $in: ['1', '2', '3']
        }
      })
    }
    mockingoose(roleModel).toReturn(finderMock, 'find')
    await roleDataAgent.getRolesById(['1', '2', '3'])
  })

  it('Successfully updates role', async () => {
    mockingoose(roleModel).toReturn(dummyRecord, 'findOne')
    const description = 'some new description that had changed'
    const permittedActions = []
    const record = { ...dummyRecord, id: 'roleId', description, permittedActions }
    mockingoose(roleModel).toReturn(record, 'save')
    const result = await roleDataAgent.updateRole(dummyRecord.id, record as any)
    expect(result.toJSON().description).toEqual(description)
    expect(result.toJSON().permittedActions).toEqual(permittedActions)
  })

  it('Fails to update non-existing role', async () => {
    mockingoose(roleModel).toReturn(undefined, 'findOne')
    const record = { ...dummyRecord, id: 'roleId' }
    const check = roleDataAgent.updateRole('someNonExistingId', record as any)
    await expect(check).rejects.toMatchObject(errorNotFound)
  })

  it('Successfully removes role', async () => {
    mockingoose(roleModel).toReturn(dummyRecord, 'findOne')
    expect.assertions(1)

    const removeMock = doc => {
      expect(doc.toJSON()).toMatchObject(dummyRecord)
    }
    mockingoose(roleModel).toReturn(removeMock, 'remove')

    await roleDataAgent.removeRole('removeRoleId')
  })

  it('Fails to remove non-existing role', async () => {
    mockingoose(roleModel).toReturn(undefined, 'findOne')
    const check = roleDataAgent.removeRole('someNonExistingId')
    await expect(check).rejects.toMatchObject(errorNotFound)
  })
})
