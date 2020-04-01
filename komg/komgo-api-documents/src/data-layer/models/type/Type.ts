import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { Model } from '../models'
import { logIndexCreation } from '../models-utils'

import { IType } from './IType'
import { TypeSchema } from './TypeSchema'

interface ITypeModel extends IType, mongoose.Document {
  id: string
}

export type TypeModel = mongoose.Model<ITypeModel>

export const Type: TypeModel = DataAccess.connection.model<ITypeModel>(Model.Type, TypeSchema)

logIndexCreation(Type)
