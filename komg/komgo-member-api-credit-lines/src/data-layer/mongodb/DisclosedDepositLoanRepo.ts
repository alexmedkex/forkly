import { IDisclosedDepositLoan } from '@komgo/types'
import { Document, Model, model } from 'mongoose'

import DisclosedDepositLoanSchema from './DisclosedDepositLoanSchema'

type DisclosedDepositLoanRepoModel = IDisclosedDepositLoan & Document

export const DisclosedDepositLoanRepo: Model<DisclosedDepositLoanRepoModel> = model<DisclosedDepositLoanRepoModel>(
  'disclosed-deposit-loans',
  DisclosedDepositLoanSchema
)
