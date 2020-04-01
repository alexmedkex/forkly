import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { Model } from '../models'
import { logIndexCreation } from '../models-utils'

import { ISharedDocuments } from './ISharedDocuments'
import { SharedDocumentsSchema } from './SharedDocumentsSchema'

interface ISharedDocumentsModel extends ISharedDocuments, mongoose.Document {
  id: string
}

export type SharedDocumentsModel = mongoose.Model<ISharedDocumentsModel>

export const SharedDocuments: SharedDocumentsModel = DataAccess.connection.model<ISharedDocumentsModel>(
  Model.SharedDocuments,
  SharedDocumentsSchema,
  'shared-documents'
)

logIndexCreation(SharedDocuments)
