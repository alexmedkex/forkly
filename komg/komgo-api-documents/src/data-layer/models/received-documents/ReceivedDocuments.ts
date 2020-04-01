import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { Model } from '../models'
import { logIndexCreation } from '../models-utils'

import { IReceivedDocuments } from './IReceivedDocuments'
import { ReceivedDocumentsSchema } from './ReceivedDocumentsSchema'

interface IReceivedDocumentsModel extends IReceivedDocuments, mongoose.Document {
  id: string
}

export type ReceivedDocumentsModel = mongoose.Model<IReceivedDocumentsModel>

export const ReceivedDocuments: ReceivedDocumentsModel = DataAccess.connection.model<IReceivedDocumentsModel>(
  Model.ReceivedDocuments,
  ReceivedDocumentsSchema,
  'received-documents'
)

logIndexCreation(ReceivedDocuments)
