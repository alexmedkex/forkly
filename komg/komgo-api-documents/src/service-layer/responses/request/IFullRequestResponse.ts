import { IProductResponse } from '../product'
import { IFullTypeResponse } from '../type/IFullTypeResponse'

export interface IFullOutgoingRequestResponse {
  id: string
  product: IProductResponse
  companyId: string
  types: IFullTypeResponse[]
  createdAt: Date
  updatedAt?: Date
  deadline?: Date
}
