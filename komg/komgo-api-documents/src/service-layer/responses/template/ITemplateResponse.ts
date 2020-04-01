import { IKeyValueResponse } from '../IKeyValueResponse'

export interface ITemplateResponse {
  id: string
  productId: string
  name: string
  types: string[]
  metadata: IKeyValueResponse[]
}
