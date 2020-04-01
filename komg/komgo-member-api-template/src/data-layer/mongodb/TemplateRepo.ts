import DataAccess from '@komgo/data-access'
import { ITemplate } from '@komgo/types'
import { Document, Model, model } from 'mongoose'

import { TemplateSchema } from './TemplateSchema'

type TemplateModel = ITemplate & Document

export type TemplateRepoModel = Model<TemplateModel>

export const TemplateRepo: TemplateRepoModel = model<TemplateModel>('template', TemplateSchema)
