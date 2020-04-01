import 'reflect-metadata'

import { HttpException } from '@komgo/microservice-config'
import { IUserProfileResponse, IUserSettings } from '@komgo/types'

const decodedToken = {
  preferred_username: 'jdoe',
  given_name: 'John',
  family_name: 'Doe',
  email: 'jdoe@komgo.com',
  realm_access: { roles: ['admin'] }
}
const mockSettings: IUserSettings = {
  userId: 'user-id',
  sendInformationNotificationsByEmail: true,
  sendTaskNotificationsByEmail: false
}

const mockDecode = jest.fn(jwt => {
  if (!jwt) throw new Error('error jwt')
  return decodedToken
})

jest.mock('jsonwebtoken', () => ({
  decode: mockDecode
}))

import { ProfileController } from './ProfileController'

describe('GetProfileByToken()', () => {
  let controller: ProfileController
  let userSettingsDataAgent

  beforeEach(() => {
    userSettingsDataAgent = { getSettings: jest.fn(() => Promise.resolve(mockSettings)) }
    controller = new ProfileController(userSettingsDataAgent)
  })

  it('returns user info from JWT', async () => {
    process.env.COMPANY_STATIC_ID = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016'
    const result: IUserProfileResponse = await controller.getProfileByToken('dummy Authorization header')

    delete process.env.COMPANY_STATIC_ID
    expect(result).toMatchObject({
      username: 'jdoe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'jdoe@komgo.com',
      roles: ['admin'],
      company: 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016'
    })

    delete process.env.COMPANY_STATIC_ID
  })

  it('includes user settings in the response', async () => {
    const result: IUserProfileResponse = await controller.getProfileByToken('dummy Authorization header')
    expect(result).toMatchObject({
      settings: mockSettings
    })
  })

  it('takes company name from an environment variable', async () => {
    process.env.COMPANY_STATIC_ID = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016'
    const result: IUserProfileResponse = await controller.getProfileByToken('dummy Authorization header')

    expect(result.company).toEqual('cf63c1f8-1165-4c94-a8f8-9252eb4f0016')

    delete process.env.COMPANY_STATIC_ID
  })

  it('makes empty company id when not provided', async () => {
    const result: IUserProfileResponse = await controller.getProfileByToken('dummy Authorization header')
    expect(result.company).toEqual('')
  })

  it('throws error if jwt token invalid ', async () => {
    await expect(controller.getProfileByToken('error')).rejects.toBeInstanceOf(HttpException)
  })
})
