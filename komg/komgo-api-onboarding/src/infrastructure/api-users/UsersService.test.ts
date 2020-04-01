import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'jest'
import 'reflect-metadata'

import UsersService from './UsersService'

const apiUsersUrl = 'http://localhost:9001'

const userRequest = {
  username: 'username',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email@ww.ww'
}

const axiosMock = new MockAdapter(axios)

describe('UsersService', () => {
  let usersService: UsersService

  beforeAll(function() {
    usersService = new UsersService(apiUsersUrl)
    postReply(apiUsersUrl, '/v0/users', 200, { id: 'test-id' })
    patchReply(apiUsersUrl, '/v0/roles/memberNodeAccount/assigned-users', 200, null)
  })

  it('creates user', async () => {
    const spy = jest.spyOn(axios, 'patch')
    await usersService.createMemberNodeAccount(userRequest)
    expect(spy).toHaveBeenCalledWith('http://localhost:9001/v0/roles/memberNodeAccount/assigned-users', {
      added: ['test-id'],
      removed: []
    })
  })

  function postReply(server, path, status, body) {
    axiosMock.onPost(`${server}${path}`).reply(status, JSON.stringify(body))
  }

  function patchReply(server, path, status, body) {
    axiosMock.onPatch(`${server}${path}`).reply(status, body)
  }
})
