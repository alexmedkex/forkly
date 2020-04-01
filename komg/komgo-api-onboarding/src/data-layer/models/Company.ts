import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { CompanySchema } from './CompanySchema'
import ICompanyDocument from './ICompanyDocument'

export type CompanyModel = mongoose.Model<ICompanyDocument>

export const Company: CompanyModel = DataAccess.connection.model<ICompanyDocument>('companies', CompanySchema)
