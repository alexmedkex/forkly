import { Product, SubProduct, ITemplate, ITemplateBinding } from '@komgo/types'
import { Map, List } from 'immutable'
import { ImmutableObject } from '../../../utils/types'
import { orderBy } from 'lodash'

export const selectTemplateByProductAndSubProduct = (
  templatesByStaticId: Map<string, Map<keyof ITemplate, ITemplate[keyof ITemplate]>>,
  productId: Product,
  subProductId: SubProduct
): List<ImmutableObject<ITemplate>> =>
  templatesByStaticId
    .toList()
    .filter(t => t.get('productId') === productId && t.get('subProductId') === subProductId)
    .toList()

export const findLatestTemplate = (templatesByStaticId: Map<string, ImmutableObject<ITemplate>>): ITemplate => {
  const templates = templatesByStaticId.toList().toJS()
  const sorted = orderBy<ITemplate>(templates, ['createdAt'], ['desc'])
  const [latest] = sorted
  return latest
}

export const findTemplateBindingsByProductAndSubProduct = (
  templateBindingsByStaticId: Map<string, Map<keyof ITemplateBinding, ITemplateBinding[keyof ITemplateBinding]>>,
  productId: Product,
  subProductId: SubProduct
): List<ImmutableObject<ITemplateBinding>> =>
  templateBindingsByStaticId
    .toList()
    .filter(t => t.get('productId') === productId && t.get('subProductId') === subProductId)
    .toList()
