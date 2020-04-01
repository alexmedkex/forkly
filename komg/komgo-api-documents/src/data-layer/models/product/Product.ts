import DataAccess from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { Model } from '../models'
import { logIndexCreation } from '../models-utils'

import { IProduct } from './IProduct'
import { ProductSchema } from './ProductSchema'

interface IProductModel extends IProduct, mongoose.Document {
  id: string
}

export type ProductModel = mongoose.Model<IProductModel>

export const Product: ProductModel = DataAccess.connection.model<IProductModel>(Model.Product, ProductSchema)

logIndexCreation(Product)
