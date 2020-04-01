import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { CustomerSchema } from './CustomerSchema'
import ICustomerDocument from './ICustomerDocument'

export type CustomerModel = mongoose.Model<ICustomerDocument>

export const Customer: CustomerModel = DataAccess.connection.model<ICustomerDocument>('customer', CustomerSchema)
