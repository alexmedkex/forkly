import DataAccess from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import mongoose from 'mongoose'

import { logIndexCreation } from '../utils/logIndexCreation'

import { IReceivablesDiscountingDocument } from './IReceivablesDiscountingDocument'
import ReceivablesDiscountingSchema from './ReceivablesDiscountingSchema'

export type ReceivablesDiscountingModel = mongoose.Model<IReceivablesDiscountingDocument>

export const ReceivablesDiscountingModel: ReceivablesDiscountingModel = DataAccess.connection.model<
  IReceivablesDiscountingDocument
>('receivables-discounting', ReceivablesDiscountingSchema)

logIndexCreation(getLogger('ReceivablesDiscountingModel'), ReceivablesDiscountingModel)
