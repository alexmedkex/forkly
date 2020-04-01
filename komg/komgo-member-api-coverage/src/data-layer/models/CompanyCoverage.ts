import * as mongoose from 'mongoose'
import DataAccess from '@komgo/data-access'

import { ICompanyCoverageDocument } from './ICompanyCoverageDocument'
import CompanyCoverageSchema from './CompanyCoverageSchema'

export type CompanyCoverageModel = mongoose.Model<ICompanyCoverageDocument>

export const CompanyCoverage: CompanyCoverageModel = DataAccess.connection.model<ICompanyCoverageDocument>(
  'companyCoverage',
  CompanyCoverageSchema
)
