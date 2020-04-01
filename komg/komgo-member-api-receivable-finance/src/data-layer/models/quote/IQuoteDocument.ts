import { IQuote } from '@komgo/types'
import Mongoose from 'mongoose'

export interface IQuoteDocument extends Mongoose.Document, IQuote {}
