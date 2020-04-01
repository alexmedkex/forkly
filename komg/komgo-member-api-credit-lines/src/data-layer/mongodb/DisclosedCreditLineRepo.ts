import { Document, Model, model } from 'mongoose'

import { IDisclosedCreditLine } from '../models/IDisclosedCreditLine'

import DisclosedCreditLineSchema from './DisclosedCreditLineSchema'

type DisclosedCreditLineRepoModel = IDisclosedCreditLine & Document

export const DisclosedCreditLineRepo: Model<DisclosedCreditLineRepoModel> = model<DisclosedCreditLineRepoModel>(
  'disclosed-credit-lines',
  DisclosedCreditLineSchema
)
