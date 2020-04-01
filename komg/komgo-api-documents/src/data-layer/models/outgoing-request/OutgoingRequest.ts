import * as mongoose from 'mongoose'

import { Model } from '../models'
import { logIndexCreation } from '../models-utils'

import { IOutgoingRequest } from './IOutgoingRequest'
import { OutgoingRequestSchema } from './OutgoingRequestSchema'

interface IOutgoingRequestModel extends IOutgoingRequest, mongoose.Document {
  id: string
}

export type OutgoingRequestModel = mongoose.Model<IOutgoingRequestModel>

export const OutgoingRequest: OutgoingRequestModel = mongoose.connection.model<IOutgoingRequestModel>(
  Model.OutgoingRequest,
  OutgoingRequestSchema,
  'outgoing-requests'
)

logIndexCreation(OutgoingRequest)
