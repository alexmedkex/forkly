import * as mongoose from 'mongoose'

import { ICompanyModel } from '../../interfaces'

export default interface ICompanyDocument extends mongoose.Document, ICompanyModel {}
