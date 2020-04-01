import { Controller, Get, Route, Security, Tags } from 'tsoa'

import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { convertProduct } from '../responses/converters'
import { IProductResponse } from '../responses/product/IProductResponse'

/**
 * Products controller
 * @export
 * @class ProductsController
 * @extends {Controller}
 */
@Tags('Products')
@Route('products')
@provideSingleton(ProductsController)
export class ProductsController extends Controller {
  constructor(@inject(TYPES.ProductDataAgent) private readonly productDataAgent: ProductDataAgent) {
    super()
  }

  /**
   * Displays supported products by name and ID.
   */
  @Security('signedIn')
  @Get()
  public async GetProducts(): Promise<IProductResponse[]> {
    const products = await this.productDataAgent.getAll()
    return products.map(convertProduct)
  }
}
