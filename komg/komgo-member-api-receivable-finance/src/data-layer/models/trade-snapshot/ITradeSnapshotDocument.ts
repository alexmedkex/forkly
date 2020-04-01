import { ITradeSnapshot } from '@komgo/types'
import Mongoose from 'mongoose'

export interface ITradeSnapshotDocument extends Mongoose.Document, ITradeSnapshot {}
