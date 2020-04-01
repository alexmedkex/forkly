import { Document, Model, model } from 'mongoose'

import { IDepositLoanRequestDocument } from '../models/IDepositLoanRequestDocument'

import DepositLoanRequestSchema from './DepositLoanRequestSchema'

type DepositLoanRequestRepoModel = IDepositLoanRequestDocument & Document

export const DepositLoanRequestRepo: Model<DepositLoanRequestRepoModel> = model<DepositLoanRequestRepoModel>(
  'deposit-loan-requests',
  DepositLoanRequestSchema
)
