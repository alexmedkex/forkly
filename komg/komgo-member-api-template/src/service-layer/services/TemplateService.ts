import { ITemplate, ITemplateBase, TemplateOrigin } from '@komgo/types'
import { inject, injectable } from 'inversify'
import { v4 as uuid4 } from 'uuid'

import { ITemplateDataAgent } from '../../data-layer/data-agents'
import { TYPES } from '../../inversify/types'
import { ITokenUser } from '../utils/ITokenUser'

@injectable()
export class TemplateService {
  constructor(@inject(TYPES.TemplateDataAgent) private templateDataAgent: ITemplateDataAgent) {}

  async createTemplate(templateBase: ITemplateBase, user: ITokenUser): Promise<ITemplate> {
    const staticId = uuid4()
    const template: ITemplate = {
      ...templateBase,
      staticId,
      origin: TemplateOrigin.Company,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return this.templateDataAgent.create(template)
  }

  async updateTemplate(staticId: string, templateBase: ITemplateBase, user: ITokenUser): Promise<ITemplate> {
    return this.templateDataAgent.update(staticId, templateBase, user)
  }

  async softDeleteTemplate(staticId: string): Promise<ITemplate> {
    return this.templateDataAgent.softDelete(staticId)
  }

  async getTemplate(staticId: string): Promise<ITemplate> {
    return this.templateDataAgent.get(staticId)
  }

  async getTemplates(projection: object = {}, options = { skip: undefined, limit: undefined }): Promise<ITemplate[]> {
    return this.templateDataAgent.getAll(projection, options)
  }

  async count(): Promise<number> {
    return this.templateDataAgent.count()
  }
}
