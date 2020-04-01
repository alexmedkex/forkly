import DataAccess from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import mongoose from 'mongoose'

import { Model } from '../constants'
import { logIndexCreation } from '../utils/logIndexCreation'

import { AutoWhitelistSchema } from './AutoWhitelistSchema'
import { IAutoWhitelistDocument } from './IAutoWhitelistDocument'

export type AutoWhitelistModel = mongoose.Model<IAutoWhitelistDocument>

export const AutoWhitelist: AutoWhitelistModel = DataAccess.connection.model<IAutoWhitelistDocument>(
  Model.AutoWhitelist,
  AutoWhitelistSchema
)

logIndexCreation(getLogger('AutoWhitelistModel'), AutoWhitelist)
