import 'reflect-metadata'
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { UsersRegistryClient } from './UsersRegistryClient'
import IUserProfile from './IUserProfile'

const axiosMock = new AxiosMockAdapter(axios)
const usersRegistryUrl = 'users-url'

const sampleUserProfile: IUserProfile = {
  id: 'testId',
  firstName: 'testFirstName',
  lastName: 'testLastName',
  company: 'testCompany',
  email: 'test@gmail.com',
  roles: [],
  username: 'testUsername'
}

const sampleJwtToken = {}

describe('UsersRegistryClient', () => {
  let usersClient: UsersRegistryClient

  beforeEach(() => {
    jest.resetAllMocks()
    axiosMock.reset()

    axiosMock
      .onGet(usersRegistryUrl + '/v0/profile', { headers: { Authorization: JSON.stringify(sampleJwtToken) } })
      .reply(200, sampleUserProfile)

    usersClient = new UsersRegistryClient(usersRegistryUrl)
  })

  it('fetches user profile', async () => {
    const result: IUserProfile = await usersClient.getUserProfile(JSON.stringify(sampleJwtToken))
    expect(result.id).toBe(sampleUserProfile.id)
  })
})
