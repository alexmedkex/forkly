import { IHasProduct } from '../../data-agents/interfaces/IHasProduct'

import { ITypeField } from './ITypeField'

export interface IType extends IHasProduct {
  categoryId: string
  name: string
  vaktId?: string
  fields: ITypeField[]
  predefined: boolean
}
