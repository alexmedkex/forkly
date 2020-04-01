import DataAccess from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import mongoose from 'mongoose'

import { logIndexCreation } from '../utils/logIndexCreation'

import { IQuoteDocument } from './IQuoteDocument'
import QuoteSchema from './QuoteSchema'

export type QuoteModel = mongoose.Model<IQuoteDocument>

export const QuoteModel: QuoteModel = DataAccess.connection.model<IQuoteDocument>('quotes', QuoteSchema)

logIndexCreation(getLogger('QuoteModel'), QuoteModel)
