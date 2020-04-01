import { injectable } from 'inversify'

import { Category, ICategory } from '../models/category'
import { IFullCategory } from '../models/category/IFullCategory'

import { BaseDataAgent } from './BaseDataAgent'
import { POPULATE_PRODUCT } from './population'

/**
 * Implements document object related methods for document categories
 * @export
 * @class CategoryDataAgentC
 */
@injectable()
export default class CategoryDataAgent extends BaseDataAgent<ICategory, IFullCategory> {
  constructor() {
    super(Category, [POPULATE_PRODUCT])
  }
}
