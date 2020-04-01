import { Document, Model, model } from 'mongoose'

import { ICreditLineRequestDocument } from '../models/ICreditLineRequestDocument'

import CreditLineRequestSchema from './CreditLineRequestSchema'

type CreditLineRequestRepoModel = ICreditLineRequestDocument & Document

export const CreditLineRequestRepo: Model<CreditLineRequestRepoModel> = model<CreditLineRequestRepoModel>(
  'credit-line-requests',
  CreditLineRequestSchema
)
