import { Document, Model, model } from 'mongoose'

import TradeSchema from './TradeSchema'
import { ITrade } from '@komgo/types'

type TradeModel = ITrade & Document

export const TradeRepo: Model<TradeModel> = model<TradeModel>('trade', TradeSchema)
