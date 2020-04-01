import DataAccess, { modelFactory } from '@komgo/data-access'
import * as mongoose from 'mongoose'

import IUserSettingsDocument from './IUserSettingsDocument'
import { UserSettingsSchema } from './UserSettingsSchema'

export type UserSettingsModel = mongoose.Model<IUserSettingsDocument>

export const userSettingsModelFactory = modelFactory<UserSettingsModel>('settings', UserSettingsSchema)
