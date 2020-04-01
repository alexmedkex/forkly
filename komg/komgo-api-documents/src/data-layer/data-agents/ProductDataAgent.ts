import { injectable } from 'inversify'

import { IProduct, Product } from '../models/product'

/**
 * Implements document object related methods for document products
 * @export
 * @class ProductDataAgent
 */
@injectable()
export default class ProductDataAgent {
  async getAll(): Promise<IProduct[]> {
    return Product.find()
  }

  async exists(id: string): Promise<boolean> {
    const product = await Product.findOne({ _id: id })
    return product != null
  }

  async getById(id: string): Promise<IProduct> {
    const product = await Product.findOne({ _id: id })
    if (product !== undefined) return product
  }
}
