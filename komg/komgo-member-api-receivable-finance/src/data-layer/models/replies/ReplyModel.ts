import DataAccess from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import mongoose from 'mongoose'

import { logIndexCreation } from '../utils/logIndexCreation'

import { IReplyDocument } from './IReplyDocument'
import ReplySchema from './ReplySchema'

export type ReplyModel = mongoose.Model<IReplyDocument>

export const ReplyModel: ReplyModel = DataAccess.connection.model<IReplyDocument>('replies', ReplySchema)

logIndexCreation(getLogger('ReplyModel'), ReplyModel)
