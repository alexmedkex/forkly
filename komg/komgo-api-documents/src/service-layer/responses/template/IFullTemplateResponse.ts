import { IKeyValueResponse } from '../IKeyValueResponse'
import { IProductResponse } from '../product'
import { IFullTypeResponse } from '../type/IFullTypeResponse'

export interface IFullTemplateResponse {
  id: string
  product: IProductResponse
  name: string
  types: IFullTypeResponse[]
  metadata: IKeyValueResponse[]
}
