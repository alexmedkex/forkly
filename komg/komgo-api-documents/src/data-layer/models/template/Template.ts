import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { Model } from '../models'
import { logIndexCreation } from '../models-utils'

import { ITemplate } from './ITemplate'
import { TemplateSchema } from './TemplateSchema'

interface ITemplateModel extends ITemplate, mongoose.Document {
  id: string
}

export type TemplateModel = mongoose.Model<ITemplateModel>

export const Template: TemplateModel = DataAccess.connection.model<ITemplateModel>(Model.Template, TemplateSchema)

logIndexCreation(Template)
