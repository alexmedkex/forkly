import { ICreditLine } from '@komgo/types'
import { Document, Model, model } from 'mongoose'

import CreditLineSchema from './CreditLineSchema'

type CreditLineRepoModel = ICreditLine & Document

export const CreditLineRepo: Model<CreditLineRepoModel> = model<CreditLineRepoModel>('credit-lines', CreditLineSchema)
