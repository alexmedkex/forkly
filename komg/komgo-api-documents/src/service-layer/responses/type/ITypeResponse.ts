import { ITypeFieldResponse } from './ITypeFieldResponse'

export interface ITypeResponse {
  id: string
  productId: string
  categoryId: string
  name: string
  vaktId?: string
  fields: ITypeFieldResponse[]
  predefined: boolean
}
