import DataAccess from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import mongoose from 'mongoose'

import { logIndexCreation } from '../utils/logIndexCreation'

import { IRFPRequestDocument } from './IRFPRequestDocument'
import RFPRequestSchema from './RFPRequestSchema'

export type RFPRequestModel = mongoose.Model<IRFPRequestDocument>

export const RFPRequestModel: RFPRequestModel = DataAccess.connection.model<IRFPRequestDocument>(
  'rfp-requests',
  RFPRequestSchema
)

logIndexCreation(getLogger('RFPRequestModel'), RFPRequestModel)
