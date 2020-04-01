import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { Model } from '../models'
import { logIndexCreation } from '../models-utils'

import { DocumentTemplateSchema } from './DocumentTemplateSchema'
import { IDocumentTemplate } from './IDocumentTemplate'

export interface IDocumentTemplateModel extends IDocumentTemplate, mongoose.Document {
  id: string
}

export type DocumentTemplateModel = mongoose.Model<IDocumentTemplateModel>

export const DocumentTemplate: DocumentTemplateModel = DataAccess.connection.model<IDocumentTemplateModel>(
  Model.DocumentTemplate,
  DocumentTemplateSchema,
  'document-templates'
)

logIndexCreation(DocumentTemplate)
