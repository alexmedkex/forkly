import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { Model } from '../models'
import { logIndexCreation } from '../models-utils'

import { DocumentSchema } from './DocumentSchema'
import { IDocument } from './IDocument'

export interface IDocumentModel extends IDocument, mongoose.Document {
  id: string
}

export type DocumentModel = mongoose.Model<IDocumentModel>

export const Document: DocumentModel = DataAccess.connection.model<IDocumentModel>(Model.Document, DocumentSchema)

logIndexCreation(Document)
