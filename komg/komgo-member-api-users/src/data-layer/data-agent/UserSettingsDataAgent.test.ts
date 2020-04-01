import DataAccess from '@komgo/data-access'
import mockingoose from 'mockingoose'
import 'reflect-metadata'

import { UserSettingsSchema } from '../models/UserSettingsSchema'

const userId = 'test-user-id'

const updatedSettingsData = {
  userId,
  sendInformationNotificationsByEmail: true,
  sendTaskNotificationsByEmail: true
}

import UserSettingsDataAgent from './UserSettingsDataAgent'
let userSettingsDataAgent
let userSettingsModel

let getUserSettings
describe('UserSettingsDataAgent', () => {
  beforeEach(() => {
    mockingoose.resetAll()
    userSettingsModel = DataAccess.connection.model('settings', UserSettingsSchema)
    getUserSettings = jest.fn(() => userSettingsModel)
    userSettingsDataAgent = new UserSettingsDataAgent(getUserSettings)
  })

  it('should return settings', async () => {
    mockingoose(userSettingsModel).toReturn(updatedSettingsData, 'findOne')
    const result = await userSettingsDataAgent.getSettings(userId)
    expect(result.toJSON()).toMatchObject(updatedSettingsData)
  })

  it('should create default settings', async () => {
    mockingoose(userSettingsModel).toReturn(null, 'findOne')
    mockingoose(userSettingsModel).toReturn(updatedSettingsData, 'save')
    const result = await userSettingsDataAgent.getSettings(userId)
    expect(result.toJSON()).toMatchObject(updatedSettingsData)
  })

  it('should update settings', async () => {
    mockingoose(userSettingsModel).toReturn(updatedSettingsData, 'findOneAndUpdate')
    const result = await userSettingsDataAgent.updateSettings(userId, updatedSettingsData)
    expect(result.toJSON()).toMatchObject(updatedSettingsData)
  })
})
