import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { IUserSettings, IUserSettingsRequest } from '@komgo/types'
import 'reflect-metadata'

import { IUserSettingsDataAgent } from '../../data-layer/data-agent/UserSettingsDataAgent'

import { SettingsController } from './SettingsController'

let userSettingsDataAgent: IUserSettingsDataAgent

const mockSettings: IUserSettings = {
  userId: 'user-id',
  sendInformationNotificationsByEmail: true,
  sendTaskNotificationsByEmail: false
}

const mockRequest: IUserSettingsRequest = {
  sendInformationNotificationsByEmail: false,
  sendTaskNotificationsByEmail: true
}

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(jwt => {
    if (!jwt) throw new Error('error jwt')
    return { sub: 'user-id' }
  })
}))

describe('SettingsController', () => {
  let controller: SettingsController
  beforeEach(() => {
    userSettingsDataAgent = {
      getSettings: jest.fn().mockResolvedValue(mockSettings),
      updateSettings: jest.fn().mockResolvedValue(mockSettings)
    }

    controller = new SettingsController(userSettingsDataAgent)
  })

  describe('GetSettingsByUserId()', () => {
    it('should return Settings', async () => {
      const result = await controller.GetSettingsByUserId('user-id')

      expect(result).toEqual(mockSettings)
    })
  })

  describe('UpdateSettingsByUserId()', () => {
    it('should update Settings', async () => {
      const result = await controller.UpdateSettingsByUserId('user-id', 'jwt-token', mockRequest)

      expect(result).toEqual(mockSettings)
    })

    it('throws error if userId in JWT does not match user ID in path', async () => {
      await expect(controller.UpdateSettingsByUserId('invalid-user-id', 'jwt-token', mockRequest)).rejects.toEqual(
        ErrorUtils.badRequestException(
          ErrorCode.ValidationHttpContent,
          'User ID passed in the route belongs to another user',
          null
        )
      )
    })
  })

  it('throws error if jwt is invalid ', async () => {
    await expect(controller.UpdateSettingsByUserId('user-id', null, mockRequest)).rejects.toBeInstanceOf(HttpException)
  })
})
