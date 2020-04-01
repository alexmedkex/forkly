import { ITemplateBinding } from '@komgo/types'
import { Document, Model, model } from 'mongoose'

import { TemplateBindingSchema } from './TemplateBindingSchema'

type TemplateBindingModel = ITemplateBinding & Document

export type TemplateBindingRepoModel = Model<TemplateBindingModel>

export const TemplateBindingRepo: TemplateBindingRepoModel = model<TemplateBindingRepoModel>(
  'templatebinding',
  TemplateBindingSchema
)
