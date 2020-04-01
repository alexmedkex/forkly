import { IProduct } from '../../models/product'

/**
 * Interface for all full models that are part of a product
 */
export interface IFullHasProduct {
  id: string
  product: IProduct
}
