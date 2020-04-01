import { injectable } from 'inversify'

import { ITemplate, Template } from '../models/template'
import { IFullTemplate } from '../models/template/IFullTemplate'

import { BaseDataAgent } from './BaseDataAgent'
import InvalidItem from './exceptions/InvalidItem'
import { POPULATE_PRODUCT, POPULATE_TYPES } from './population'

/**
 * Implements document object related methods for document templates
 * @export
 * @class TemplateDataAgent
 */
@injectable()
export default class TemplateDataAgent extends BaseDataAgent<ITemplate, IFullTemplate> {
  constructor() {
    super(Template, [POPULATE_PRODUCT, POPULATE_TYPES])
  }

  protected validateNewRecord(template: ITemplate): void {
    if (template.id) {
      throw new InvalidItem('Template ID is automatically generated')
    }
  }

  protected validateUpdateRecord(oldTemplate: ITemplate, newTemplate: ITemplate): void {
    if (!newTemplate.id) {
      throw new InvalidItem('Template ID is empty')
    }
  }
}
