import { Document, Model, model } from 'mongoose'

import { CounterSchema } from './CounterSchema'
import { ICounter } from '../../models/ICounter'

export type CounterModel = ICounter & Document

export const CounterRepo: Model<CounterModel> = model<CounterModel>('referenceCounter', CounterSchema)
