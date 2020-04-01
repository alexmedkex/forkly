import { IFullHasProduct } from '../../data-agents/interfaces/IFullHasProduct'
import { IKeyValue } from '../IKeyValue'
import { IFullType } from '../type/IFullType'

export interface IFullTemplate extends IFullHasProduct {
  name: string
  types: IFullType[]
  metadata: IKeyValue[]
}
