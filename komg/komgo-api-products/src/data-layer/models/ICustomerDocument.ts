import * as mongoose from 'mongoose'

import ICustomer from './ICustomer'

export default interface ICustomerDocument extends mongoose.Document, ICustomer {}
