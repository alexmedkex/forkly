import { IDepositLoan } from '@komgo/types'
import { Document, Model, model } from 'mongoose'

import DepositLoanRepoSchema from './DepositLoanRepoSchema'

type DepositLoanRepoModel = IDepositLoan & Document

export const DepositLoanRepo: Model<DepositLoanRepoModel> = model<DepositLoanRepoModel>(
  'deposit-loans',
  DepositLoanRepoSchema
)
