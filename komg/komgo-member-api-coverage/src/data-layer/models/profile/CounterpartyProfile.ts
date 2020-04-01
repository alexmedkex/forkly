import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { CounterpartyProfileSchema } from './CounterpartyProfileSchema'
import { ICounterpartyProfile } from './ICounterpartyProfile'

export interface ICounterpartyProfileModel extends ICounterpartyProfile, mongoose.Document {
  id: string
}

export type CounterpartyProfileModel = mongoose.Model<ICounterpartyProfileModel>

export const CounterpartyProfile: CounterpartyProfileModel = DataAccess.connection.model<ICounterpartyProfileModel>(
  'counterparty-profiles',
  CounterpartyProfileSchema
)
