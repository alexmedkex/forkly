import { Document, Schema, Model, model } from 'mongoose'

import { LCSchema } from './LCSchema'
import { ILC } from '../models/ILC'

export type LCModel = ILC & Document

export const LCRepo: Model<LCModel> = model<LCModel>('LC', LCSchema)
