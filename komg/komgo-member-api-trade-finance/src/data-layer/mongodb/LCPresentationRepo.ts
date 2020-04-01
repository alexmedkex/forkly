import { Document, Model, model } from 'mongoose'

import { ILCPresentation } from '../models/ILCPresentation'
import { LCPresentationSchema } from './LCPresentationSchema'

export type LCPresentationModel = ILCPresentation & Document

export const LCPresentationRepo: Model<LCPresentationModel> = model<LCPresentationModel>(
  'LCPresentation',
  LCPresentationSchema
)
