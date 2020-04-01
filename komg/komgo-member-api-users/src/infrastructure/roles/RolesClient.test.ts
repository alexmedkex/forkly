import 'reflect-metadata'

import axios from 'axios'
import 'jest'

import MockAdapter from 'axios-mock-adapter'

import RolesClient from './RolesClient'

describe('RolesClient', () => {
  let rolesClient
  let axiosMock

  beforeEach(() => {
    const axiosInstance = axios.create()
    axiosMock = new MockAdapter(axiosInstance)
    rolesClient = new RolesClient('base-url', axiosInstance)
  })

  it('should get role', async () => {
    axiosMock.onGet(/.*/).reply(200, {})
    expect(await rolesClient.getRole('role-id')).toEqual({})
  })

  it('should create role', async () => {
    axiosMock.onPost(/.*/).reply(200, {})
    expect(await rolesClient.createRole({})).toEqual({})
  })

  it('should update role', async () => {
    axiosMock.onPut(/.*/).reply(200, {})
    expect(await rolesClient.updateRole('role-id', {})).toEqual({})
  })

  it('should delete role', async () => {
    axiosMock.onDelete(/.*/).reply(204)
    expect(await rolesClient.deleteRole('role-id')).toEqual(undefined)
  })
})
