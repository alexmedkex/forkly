import { IProductResponse } from '../product'

export interface IFullCategoryResponse {
  id: string
  product: IProductResponse
  name: string
}
