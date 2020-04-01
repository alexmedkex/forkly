import { injectable } from 'inversify'

import { allUnique } from '../../utils'
import { IType, ITypeField, Type } from '../models/type'
import { IFullType } from '../models/type/IFullType'

import { BaseDataAgent } from './BaseDataAgent'
import InvalidItem from './exceptions/InvalidItem'
import InvalidOperation from './exceptions/InvalidOperation'
import { POPULATE_PRODUCT, POPULATE_CATEGORY } from './population'

/**
 * Implements document object related methods for document types
 * @export
 * @class TypeDataAgent
 */
@injectable()
export default class TypeDataAgent extends BaseDataAgent<IType, IFullType> {
  constructor() {
    super(Type, [POPULATE_PRODUCT, POPULATE_CATEGORY])
  }

  async getAllInCategory(productId: string, categoryId: string): Promise<IFullType[]> {
    return this.populateMany(Type.find({ productId, categoryId }))
  }

  async delete(productId: string, id: string): Promise<void> {
    await this.checkIfCanDeleteType(productId, id)
    await super.delete(productId, id)
  }

  async checkIfCanDeleteType(productId: string, id: string) {
    const docType = await Type.findOne({ _id: id, productId })
    this.checkIfPredefinedType(docType)
  }

  async getTypesByIds(typeIds: string[]): Promise<IType[]> {
    const result = this.model
      .find({
        _id: { $in: typeIds }
      })
      .exec()

    return result as Promise<IType[]>
  }

  protected validateUpdatedRecord(oldType: IType, newType: IType) {
    if (oldType.categoryId !== newType.categoryId) {
      throw new InvalidItem('Cannot change category id')
    }
    this.validateUniqueFields(newType.fields)
    this.checkIfPredefinedType(oldType)
  }

  protected validateNewRecord(type: IType): void {
    this.validateUniqueFields(type.fields)
  }

  private checkIfPredefinedType(type: IType) {
    if (type && type.predefined === true) {
      throw new InvalidOperation('Cannot change a predefined document type')
    }
  }

  private validateUniqueFields(fields: ITypeField[]) {
    if (!fields) {
      return
    }

    if (!allUnique(fields.map(f => f.id))) {
      throw new InvalidItem('Fields should have unique ids')
    }
    if (!allUnique(fields.map(f => f.name))) {
      throw new InvalidItem('Fields should have unique names')
    }
  }
}
