import { IFullCategoryResponse } from '../category/IFullCategoryResponse'
import { IProductResponse } from '../product'

import { ITypeFieldResponse } from './ITypeFieldResponse'

export interface IFullTypeResponse {
  id: string
  product: IProductResponse
  category: IFullCategoryResponse
  name: string
  vaktId?: string
  fields: ITypeFieldResponse[]
  predefined: boolean
}
