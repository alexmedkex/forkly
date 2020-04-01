import { IUserSettings } from '@komgo/types'
import * as mongoose from 'mongoose'

export default interface ISettingsDocument extends mongoose.Document, IUserSettings {}
