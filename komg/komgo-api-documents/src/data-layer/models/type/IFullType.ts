import { IFullHasProduct } from '../../data-agents/interfaces/IFullHasProduct'
import { IFullCategory } from '../category/IFullCategory'

import { ITypeField } from './ITypeField'

export interface IFullType extends IFullHasProduct {
  category: IFullCategory
  name: string
  vaktId?: string
  fields: ITypeField[]
  predefined: boolean
}
