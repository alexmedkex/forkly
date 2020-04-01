import { IReceivablesDiscounting } from '@komgo/types'
import Mongoose from 'mongoose'

export interface IReceivablesDiscountingDocument extends Mongoose.Document, IReceivablesDiscounting {}
