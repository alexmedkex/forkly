import { ISharedCreditLine, IInformationShared } from '@komgo/types'
import { Document, Model, model } from 'mongoose'

import SharedCreditLineSchema from './SharedCreditLineSchema'

type SharedCreditLineRepoModel = ISharedCreditLine<IInformationShared> & Document

export const SharedCreditLineRepo: Model<SharedCreditLineRepoModel> = model<SharedCreditLineRepoModel>(
  'shared-credit-lines',
  SharedCreditLineSchema
)
