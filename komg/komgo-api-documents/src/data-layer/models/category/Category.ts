import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { Model } from '../models'
import { logIndexCreation } from '../models-utils'

import { CategorySchema } from './CategorySchema'
import { ICategory } from './ICategory'

interface ICategoryModel extends ICategory, mongoose.Document {
  id: string
}

export type CategoryModel = mongoose.Model<ICategoryModel>

export const Category: CategoryModel = DataAccess.connection.model<ICategoryModel>(Model.Category, CategorySchema)

logIndexCreation(Category)
