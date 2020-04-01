import * as mongoose from 'mongoose'

import { Model } from '../models'
import { logIndexCreation } from '../models-utils'

import { IIncomingRequest } from './IIncomingRequest'
import { IncomingRequestSchema } from './IncomingRequestSchema'

interface IIncomingRequestModel extends IIncomingRequest, mongoose.Document {
  id: string
}

export type IncomingRequestModel = mongoose.Model<IIncomingRequestModel>

export const IncomingRequest: IncomingRequestModel = mongoose.connection.model<IIncomingRequestModel>(
  Model.IncomingRequest,
  IncomingRequestSchema,
  'incoming-requests'
)

logIndexCreation(IncomingRequest)
