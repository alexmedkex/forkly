import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { IDeactivatedDocumentResponse } from '../../service-layer/responses/document/IDeactivatedDocumentResponse'

import { DeactivatedDocumentSchema } from './DeactivatedDocumentSchema'

export type IDeactivatedDocumentModel = mongoose.Model<IDeactivatedDocumentResponse>

export const DeactivatedDocument: IDeactivatedDocumentModel = DataAccess.connection.model<IDeactivatedDocumentResponse>(
  'deactivatedDocument',
  DeactivatedDocumentSchema
)
