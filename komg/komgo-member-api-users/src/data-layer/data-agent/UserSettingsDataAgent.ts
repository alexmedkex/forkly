import { IModelFactory } from '@komgo/data-access'
import { IUserSettings } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { UserSettingsModel } from '../models/UserSettings'

export interface IUserSettingsDataAgent {
  getSettings(userId: string): Promise<IUserSettings>
  updateSettings(userId: string, settings: IUserSettings): Promise<IUserSettings>
}

@injectable()
export default class UserSettingsDataAgent implements IUserSettingsDataAgent {
  private readonly userSettingsModel: UserSettingsModel

  constructor(@inject('Factory<UserSettingsModel>') getUserSettingsModel: IModelFactory<UserSettingsModel>) {
    this.userSettingsModel = getUserSettingsModel()
  }

  async getSettings(userId: string): Promise<IUserSettings> {
    let settings = await this.userSettingsModel.findOne({ userId }).exec()

    if (!settings) {
      settings = await this.createSettings(userId)
    }
    return settings
  }

  async updateSettings(userId: string, settings: IUserSettings): Promise<IUserSettings> {
    return this.userSettingsModel.findOneAndUpdate({ userId }, settings, { upsert: true, new: true }).exec()
  }

  private async createSettings(userId: string, settings?: IUserSettings): Promise<IUserSettings> {
    if (!settings) {
      settings = {
        userId,
        sendInformationNotificationsByEmail: true,
        sendTaskNotificationsByEmail: true
      }
    }
    return this.userSettingsModel.create(settings)
  }
}
