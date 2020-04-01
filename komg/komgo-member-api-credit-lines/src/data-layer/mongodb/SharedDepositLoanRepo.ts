import { ISharedDepositLoan } from '@komgo/types'
import { Document, Model, model } from 'mongoose'

import SharedDepositLoanSchema from './SharedDepositLoanSchema'

type SharedDepositLoanRepoModel = ISharedDepositLoan & Document

export const SharedDepositLoanRepo: Model<SharedDepositLoanRepoModel> = model<SharedDepositLoanRepoModel>(
  'shared-deposit-loans',
  SharedDepositLoanSchema
)
