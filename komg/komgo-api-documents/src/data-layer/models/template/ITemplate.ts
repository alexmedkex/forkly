import { IHasProduct } from '../../data-agents/interfaces/IHasProduct'
import { IKeyValue } from '../IKeyValue'

export interface ITemplate extends IHasProduct {
  name: string
  types: string[]
  metadata: IKeyValue[]
}
